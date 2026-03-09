const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// POST /api/users/login  — verify user credentials
router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'name and password are required' });

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM widget_users WHERE name = $1 AND password = $2',
      [name, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid User ID or password' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('POST /api/users/login:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/users  — list all users
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, password, created_at FROM widget_users ORDER BY created_at ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/users:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/users  — create a new user (master control only)
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO widget_users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, password, created_at',
      [name, email || null, password || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error('POST /api/users:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PATCH /api/users/:id  — update name and/or password
router.patch('/:id', async (req, res) => {
  const { name, password } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const { rows } = await pool.query(
      `UPDATE widget_users
         SET name = $1, password = COALESCE(NULLIF($2, ''), password), updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, password, created_at`,
      [name, password || '', req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/users:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM widget_users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/users:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
