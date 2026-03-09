import React, { useState, useEffect } from 'react';
import './mastercontrol.css';

const API = (process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:5001');

const MASTER_USER = 'admin';
const MASTER_PASS = 'admin';

const MasterControl = () => {
  const [authed, setAuthed]           = useState(() => sessionStorage.getItem('mc_auth') === '1');
  const [loginUser, setLoginUser]     = useState('');
  const [loginPass, setLoginPass]     = useState('');
  const [loginError, setLoginError]   = useState('');

  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const [showAdd, setShowAdd]         = useState(false);
  const [newUserId, setNewUserId]     = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');

  const [editUser, setEditUser]       = useState(null);   // user being edited
  const [editName, setEditName]       = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editShowPass, setEditShowPass] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [editError, setEditError]     = useState('');

  // ── Load users once logged in ─────────────────────────────────
  useEffect(() => {
    if (authed) fetchUsers();
  }, [authed]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/users`);
      if (!res.ok) throw new Error('Failed to load users');
      setUsers(await res.json());
    } catch (e) {
      setError('Cannot reach backend. Make sure the API server is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  // ── Login ─────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUser === MASTER_USER && loginPass === MASTER_PASS) {
      sessionStorage.setItem('mc_auth', '1');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mc_auth');
    setAuthed(false);
    setUsers([]);
  };

  // ── Create user ───────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUserId.trim() || !newPassword.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserId.trim(), password: newPassword.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }
      const created = await res.json();
      setUsers(prev => [...prev, created]);
      setNewUserId('');
      setNewPassword('');
      setShowAdd(false);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ── Delete user ───────────────────────────────────────────────
  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}" and all their settings? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/api/users/${userId}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch {
      alert('Failed to delete user.');
    }
  };

  // ── Open edit modal ───────────────────────────────────────────
  const openEdit = (u) => {
    setEditUser(u);
    setEditName(u.name);
    setEditPassword('');
    setEditShowPass(false);
    setEditError('');
  };

  // ── Save edit ─────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    setEditError('');
    try {
      const body = { name: editName.trim() };
      if (editPassword.trim()) body.password = editPassword.trim();
      const res = await fetch(`${API}/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditUser(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Login screen ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="mc-page">
        <div className="mc-login-card">
          <div className="mc-login-logo">
            <span className="mc-login-icon">🛡️</span>
            <h1 className="mc-login-title">Master Control</h1>
            <p className="mc-login-sub">Chatbot Widget Management</p>
          </div>
          <form onSubmit={handleLogin} className="mc-login-form">
            {loginError && <div className="mc-error">{loginError}</div>}
            <div className="mc-field">
              <label className="mc-label">Username</label>
              <input
                className="mc-input"
                type="text"
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
                placeholder="admin"
                autoFocus
                required
              />
            </div>
            <div className="mc-field">
              <label className="mc-label">Password</label>
              <input
                className="mc-input"
                type="password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>
            <button type="submit" className="mc-btn mc-btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main panel ────────────────────────────────────────────────
  return (
    <div className="mc-page mc-page-dash">
      {/* Header */}
      <header className="mc-header">
        <div className="mc-header-left">
          <span className="mc-header-icon">🛡️</span>
          <span className="mc-header-title">Master Control</span>
        </div>
        <div className="mc-header-right">
          <a href="/admin.html" className="mc-link">Go to Admin Panel →</a>
          <button className="mc-btn mc-btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Body */}
      <main className="mc-main">
        <div className="mc-card">
          <div className="mc-card-header">
            <div>
              <h2 className="mc-card-title">Users</h2>
              <p className="mc-card-sub">Each user gets a unique embed script for their website.</p>
            </div>
            <button className="mc-btn mc-btn-primary" onClick={() => { setShowAdd(true); setCreateError(''); }}>
              + Add User
            </button>
          </div>

          {error && <div className="mc-error" style={{ marginBottom: 16 }}>{error}</div>}

          {loading ? (
            <div className="mc-loading">Loading users…</div>
          ) : (
            <table className="mc-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>UUID (embed script)</th>
                  <th>Created</th>
                  <th>Password</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="mc-table-empty">No users yet. Click "Add User" to create one.</td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td><code className="mc-code">{u.id}</code></td>
                    <td className="mc-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="mc-muted">{u.password ? '••••••' : <span className="mc-na">—</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="mc-btn mc-btn-edit"
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </button>
                        <button
                          className="mc-btn mc-btn-danger"
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editUser && (
        <div className="mc-overlay" onClick={() => setEditUser(null)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <h2 className="mc-modal-title">Edit User</h2>
            <p className="mc-modal-sub">UUID cannot be changed. Leave password blank to keep existing.</p>
            <form onSubmit={handleEdit}>
              {editError && <div className="mc-error" style={{ marginBottom: 12 }}>{editError}</div>}
              <div className="mc-field">
                <label className="mc-label">User ID <span className="mc-required">*</span></label>
                <input
                  className="mc-input"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="mc-field">
                <label className="mc-label">UUID</label>
                <input className="mc-input" value={editUser.id} disabled style={{ color: '#aaa', fontSize: 12 }} />
              </div>
              <div className="mc-field">
                <label className="mc-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="mc-input"
                    type={editShowPass ? 'text' : 'password'}
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPass(p => !p)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13 }}
                  >
                    {editShowPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <span className="mc-hint">Only filled in if you want to change the password.</span>
              </div>
              <div className="mc-modal-actions">
                <button type="button" className="mc-btn mc-btn-ghost" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="mc-btn mc-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="mc-overlay" onClick={() => setShowAdd(false)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <h2 className="mc-modal-title">Add New User</h2>
            <p className="mc-modal-sub">The UUID will be auto-generated for use in the embed script.</p>
            <form onSubmit={handleCreate}>
              {createError && <div className="mc-error" style={{ marginBottom: 12 }}>{createError}</div>}
              <div className="mc-field">
                <label className="mc-label">User ID <span className="mc-required">*</span></label>
                <input
                  className="mc-input"
                  type="text"
                  value={newUserId}
                  onChange={e => setNewUserId(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  autoFocus
                  required
                />
                <span className="mc-hint">A name to identify this user / tenant.</span>
              </div>
              <div className="mc-field">
                <label className="mc-label">Password <span className="mc-required">*</span></label>
                <input
                  className="mc-input"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
                <span className="mc-hint">Stored with this user's record.</span>
              </div>
              <div className="mc-modal-actions">
                <button type="button" className="mc-btn mc-btn-ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className="mc-btn mc-btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterControl;
