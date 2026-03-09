require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const usersRouter    = require('./routes/users');
const settingsRouter = require('./routes/settings');
const logsRouter     = require('./routes/logs');

const app  = express();
const PORT = process.env.PORT || 5001;

const DB_NAME = process.env.DB_NAME || 'chatbot_admin';

// ── CORS ────────────────────────────────────────────────────────
// ADMIN_ORIGINS: static list from .env — always allowed (admin panel, dev).
// Widget routes (GET /api/settings/:userId, POST /api/logs/:userId) also
// allow any origin that the user has whitelisted in their DB settings,
// so customers never need a server config change.
const ADMIN_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000')
  .split(',').map(o => o.trim()).filter(Boolean);

// Fetch allowed origins for a userId from DB (cached briefly to avoid per-request queries)
const _originCache = new Map(); // userId -> { origins: string[], exp: number }
async function getUserAllowedOrigins(pool, userId) {
  const now = Date.now();
  const cached = _originCache.get(userId);
  if (cached && cached.exp > now) return cached.origins;

  try {
    const { rows } = await pool.query(
      `SELECT settings->'workflow'->'allowedOrigins' AS origins
       FROM widget_settings WHERE user_id = $1`, [userId]
    );
    const origins = (rows[0]?.origins) || [];
    _originCache.set(userId, { origins, exp: now + 60_000 }); // cache 60s
    return origins;
  } catch {
    return [];
  }
}

// Invalidate cache entry when settings are saved
function invalidateOriginCache(userId) { _originCache.delete(userId); }

// Dynamic CORS middleware factory — call with the lazily-resolved pool
function buildCorsMiddleware(getPool) {
  return async (req, res, next) => {
    const origin = req.headers.origin;

    // No origin (curl, server-to-server) — always allow
    if (!origin) return next();

    // Admin origins — always allow
    if (ADMIN_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      if (req.method === 'OPTIONS') return res.sendStatus(204);
      return next();
    }

    // Widget routes: check user's DB whitelist
    // Matches: GET  /api/settings/:userId
    //          POST /api/logs/:userId
    const widgetMatch = req.path.match(/^\/api\/(?:settings|logs)\/([0-9a-f-]{36})/i);
    if (widgetMatch) {
      const pool = getPool();
      if (pool) {
        const allowed = await getUserAllowedOrigins(pool, widgetMatch[1]);
        // Empty list = unrestricted (user hasn't set any whitelist yet)
        if (allowed.length === 0 || allowed.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          if (req.method === 'OPTIONS') return res.sendStatus(204);
          return next();
        }
      }
    }

    // Blocked
    console.error(`CORS: origin "${origin}" not allowed for ${req.method} ${req.path}`);
    res.status(403).json({ error: 'CORS: origin not allowed' });
  };
}

// ── Inline migration SQL (all idempotent) ───────────────────────
const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS widget_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(128) NOT NULL,
  email      VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  password   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS widget_settings (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES widget_users(id) ON DELETE CASCADE,
  settings   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS widget_users_updated_at ON widget_users;
CREATE TRIGGER widget_users_updated_at
  BEFORE UPDATE ON widget_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS widget_settings_updated_at ON widget_settings;
CREATE TRIGGER widget_settings_updated_at
  BEFORE UPDATE ON widget_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS chat_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES widget_users(id) ON DELETE CASCADE,
  session_id  VARCHAR(64) NOT NULL,
  sender      VARCHAR(8)  NOT NULL CHECK (sender IN ('user', 'bot')),
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_logs_user_id_idx ON chat_logs (user_id, created_at DESC);
`;

// ── Ensure the database exists, then run migrations ────────────
async function ensureDatabase() {
  // Connect to the default 'postgres' DB to create our DB if missing
  const adminPool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    const { rows } = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]
    );
    if (rows.length === 0) {
      console.log(`📦  Database "${DB_NAME}" not found — creating it...`);
      // Cannot use parameterised query for CREATE DATABASE
      await adminPool.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅  Database "${DB_NAME}" created`);
    } else {
      console.log(`✅  Database "${DB_NAME}" already exists`);
    }
  } finally {
    await adminPool.end();
  }
}

async function tablesExist(pool) {
  const { rows } = await pool.query(`
    SELECT COUNT(*) AS count FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'widget_users'
  `);
  return parseInt(rows[0].count, 10) > 0;
}

async function runMigrations(pool) {
  // Skip if tables are already in place (avoids permission errors on re-start)
  if (await tablesExist(pool)) {
    console.log('✅  Tables already exist — skipping migrations');
    return;
  }

  console.log('🔄  Tables not found — running migrations...');

  // pgcrypto requires superuser; try it but don't fail if denied
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  } catch {
    console.warn('⚠️   Could not create pgcrypto extension (needs superuser). Run manually:');
    console.warn(`    sudo -u postgres psql -d ${DB_NAME} -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'`);
  }

  try {
    await pool.query(MIGRATION_SQL);
    console.log('✅  Migrations complete');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    console.error('    The database user lacks schema permissions. Fix it once with:');
    console.error(`    sudo -u postgres psql -d ${DB_NAME} -c "GRANT ALL ON SCHEMA public TO ${process.env.DB_USER || 'chatbot_user'}; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${process.env.DB_USER || 'chatbot_user'}; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${process.env.DB_USER || 'chatbot_user'};"`);
    console.error('    Then run: pm2 restart chatbot-backend --update-env');
    process.exit(1);
  }
}

// ── Middleware ──────────────────────────────────────────────────
// Pool is not available until start() resolves; use a getter so the
// middleware closure always picks up the live instance.
let _pool = null;
app.use(buildCorsMiddleware(() => _pool));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/users',    usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/logs',     logsRouter);
// Expose cache invalidation so settings route can clear it on save
app.locals.invalidateOriginCache = invalidateOriginCache;

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ───────────────────────────────────────────────────────
async function start() {
  console.log('🔧  Starting Chatbot Admin API...');
  console.log(`    Port     : ${PORT}`);
  console.log(`    Database : ${DB_NAME} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);

  // Step 1 — ensure DB exists
  try {
    await ensureDatabase();
  } catch (err) {
    console.error('❌  Could not create/verify database:', err.message);
    process.exit(1);
  }

  // Step 2 — connect to our DB and run migrations
  const pool = require('./db');
  _pool = pool; // make available to dynamic CORS middleware
  try {
    await pool.query('SELECT 1');
    console.log('✅  PostgreSQL connected');
  } catch (err) {
    console.error('❌  PostgreSQL connection failed:', err.message);
    process.exit(1);
  }

  try {
    await runMigrations(pool);
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀  Admin API running at http://localhost:${PORT}`);
    console.log(`    Routes: GET/POST /api/users  |  GET/PUT /api/settings/:id  |  GET /api/logs/:id`);
  });
}

start();
