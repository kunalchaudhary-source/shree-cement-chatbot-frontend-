const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/logs/:userId  -- fetch all logs grouped by session
router.get('/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, session_id, sender, message, created_at
         FROM chat_logs
        WHERE user_id = $1
        ORDER BY created_at ASC`,
      [req.params.userId]
    );
    // Group by session_id
    const sessions = {};
    rows.forEach(row => {
      if (!sessions[row.session_id]) {
        sessions[row.session_id] = { session_id: row.session_id, started_at: row.created_at, messages: [] };
      }
      sessions[row.session_id].messages.push({
        id:         row.id,
        sender:     row.sender,
        message:    row.message,
        created_at: row.created_at,
      });
    });
    res.json(Object.values(sessions).reverse()); // newest session first
  } catch (err) {
    console.error('GET /api/logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/logs/:userId  -- append a single message
router.post('/:userId', async (req, res) => {
  const { session_id, sender, message } = req.body;
  if (!session_id || !sender || !message) {
    return res.status(400).json({ error: 'session_id, sender and message are required' });
  }
  try {
    await pool.query(
      `INSERT INTO chat_logs (user_id, session_id, sender, message)
       VALUES ($1, $2, $3, $4)`,
      [req.params.userId, session_id, sender, message]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /api/logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/logs/:userId  -- clear all logs for this user
router.delete('/:userId', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM chat_logs WHERE user_id = $1',
      [req.params.userId]
    );
    res.json({ deleted: rowCount });
  } catch (err) {
    console.error('DELETE /api/logs:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
