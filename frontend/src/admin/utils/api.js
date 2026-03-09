// API communication with the Express backend
const API_BASE = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:5001';

export async function apiGetUsers() {
  const res = await fetch(`${API_BASE}/api/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json(); // [{ id, name, email, created_at }]
}

export async function apiCreateUser({ name, email }) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create user');
  }
  return res.json(); // { id, name, email, created_at }
}

export async function apiDeleteUser(userId) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function apiGetSettings(userId) {
  const res = await fetch(`${API_BASE}/api/settings/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  const { settings } = await res.json();
  return settings; // plain object (may be empty {})
}

export async function apiSaveSettings(userId, settings) {
  const res = await fetch(`${API_BASE}/api/settings/${userId}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ settings }),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  const data = await res.json();

  // Notify any widget tabs listening on this userId to re-render immediately
  if (typeof BroadcastChannel !== 'undefined') {
    const ch = new BroadcastChannel('chatbot-settings');
    ch.postMessage({ userId, settings });
    ch.close();
  }

  return data;
}

export async function apiResetSettings(userId) {
  const res = await fetch(`${API_BASE}/api/settings/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to reset settings');
}

// ── Logs ────────────────────────────────────────────────────────────────────

export async function apiGetLogs(userId) {
  const res = await fetch(`${API_BASE}/api/logs/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json(); // array of session objects
}

export async function apiDeleteLogs(userId) {
  const res = await fetch(`${API_BASE}/api/logs/${userId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete logs');
  return res.json(); // { deleted: N }
}
