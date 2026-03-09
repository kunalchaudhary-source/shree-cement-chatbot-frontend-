require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const usersRouter    = require('./routes/users');
const settingsRouter = require('./routes/settings');
const logsRouter     = require('./routes/logs');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: '*' }));          // allow widget on any domain
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/users',    usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/logs',     logsRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ───────────────────────────────────────────────────────
async function start() {
  // Verify DB connection
  try {
    await pool.query('SELECT 1');
    console.log('✅  PostgreSQL connected');
  } catch (err) {
    console.error('❌  PostgreSQL connection failed:', err.message);
    console.error('    Make sure PostgreSQL is running and .env credentials are correct.');
    console.error('    Hint: run "psql -U postgres -d chatbot_admin -f migrations/init.sql" to create tables.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀  Admin API running at http://localhost:${PORT}`);
   // console.log(`    GET  /api/users`);
    //console.log(`    POST /api/users`);
   // console.log(`    GET  /api/settings/:userId`);
   // console.log(`    PUT  /api/settings/:userId`);
  });
}

start();
