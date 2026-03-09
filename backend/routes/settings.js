const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/settings/:userId  — load settings for a user (public, used by widget)
router.get('/:userId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT settings, updated_at FROM widget_settings WHERE user_id = $1',
      [req.params.userId]
    );
    if (rows.length === 0) {
      // No settings saved yet — return empty object; widget uses its own defaults
      return res.json({ settings: {}, updated_at: null });
    }
    res.json({ settings: rows[0].settings, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error('GET /api/settings:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/settings/:userId  — save (upsert) settings
router.put('/:userId', async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings object required in body' });
  }

  try {
    // Verify user exists
    const user = await pool.query('SELECT id FROM widget_users WHERE id = $1', [req.params.userId]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO widget_settings (user_id, settings)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
         SET settings = EXCLUDED.settings, updated_at = NOW()
       RETURNING settings, updated_at`,
      [req.params.userId, JSON.stringify(settings)]
    );

    // Invalidate the CORS origin cache so new allowedOrigins take effect immediately
    if (typeof req.app.locals.invalidateOriginCache === 'function') {
      req.app.locals.invalidateOriginCache(req.params.userId);
    }

    res.json({ settings: rows[0].settings, updated_at: rows[0].updated_at });
  } catch (err) {
    console.error('PUT /api/settings:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/settings/:userId  — reset settings (delete row; defaults are served by widget)
router.delete('/:userId', async (req, res) => {
  try {
    await pool.query('DELETE FROM widget_settings WHERE user_id = $1', [req.params.userId]);
    res.json({ message: 'Settings reset' });
  } catch (err) {
    console.error('DELETE /api/settings:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
