require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');

const usersRouter    = require('./routes/users');
const settingsRouter = require('./routes/settings');
const logsRouter     = require('./routes/logs');

const app  = express();
const PORT = process.env.PORT || 5001;

const DB_NAME = process.env.DB_NAME || 'chatbot_admin';

// ── CORS ────────────────────────────────────────────────────────
// ALLOWED_ORIGINS is a comma-separated list in .env
// e.g. ALLOWED_ORIGINS=https://sclchatbot.digiiq.ai,http://localhost:4000
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ── Inline migration SQL (all idempotent) ───────────────────────
const MIGRATION_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

async function runMigrations(pool) {
  console.log('🔄  Running migrations...');
  await pool.query(MIGRATION_SQL);
  console.log('✅  Migrations complete');
}

// ── Middleware ──────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight for all routes
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
