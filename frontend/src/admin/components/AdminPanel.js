import React, { useState, useEffect } from 'react';
import AppearanceSettings from './sections/AppearanceSettings';
import ContentSettings from './sections/ContentSettings';
import BehaviorSettings from './sections/BehaviorSettings';
import ScriptSettings from './sections/ScriptSettings';
import LogsSection from './sections/LogsSection';
import WorkflowSettings from './sections/WorkflowSettings';
import WidgetPreview from './common/WidgetPreview';
import { exportJSON, importJSON } from '../utils/storage';
import { apiGetSettings, apiSaveSettings, apiResetSettings } from '../utils/api';
import defaultSettings from '../config/defaultSettings';
import '../../styles/admin.css';

const API = (process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:5001');

const TABS = [
  { id: 'appearance', label: 'Appearance'     },
  { id: 'content',    label: 'Content'        },
  { id: 'behavior',   label: 'Behavior'       },
  { id: 'workflow',   label: 'Workflow Setup' },
  { id: 'script',     label: 'Script'         },
  { id: 'logs',       label: 'Logs'           },
];

function deepMerge(target, source) {
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  return output;
}

const LoginScreen = ({ onLogin }) => {
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password: password.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const user = await res.json();
      sessionStorage.setItem('ap_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-login-page">
      <div className="ap-login-card">
        <div className="ap-login-logo">
          <h1 className="ap-login-title">Chatbot Admin</h1>
          <p className="ap-login-sub">Sign in to manage your widget</p>
        </div>
        <form onSubmit={handleSubmit} className="ap-login-form">
          {error && <div className="ap-error-banner" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="ap-field-col" style={{ padding: 0, border: 'none' }}>
            <label className="ap-label">User ID</label>
            <input
              className="ap-text-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your user ID"
              autoFocus
              required
            />
          </div>
          <div className="ap-field-col" style={{ padding: 0, border: 'none' }}>
            <label className="ap-label">Password</label>
            <input
              className="ap-text-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="ap-btn ap-btn-save"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ap_user') || 'null'); } catch { return null; }
  });
  const [settings, setSettings]         = useState(() => JSON.parse(JSON.stringify(defaultSettings)));
  const [activeTab, setActiveTab]       = useState('appearance');
  const [saved, setSaved]               = useState(false);
  const [saving, setSaving]             = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [apiError, setApiError]         = useState('');
  const [previewMode, setPreviewMode]   = useState('desktop');

  useEffect(() => {
    if (!loggedInUser) return;
    setLoadingSettings(true);
    setApiError('');
    apiGetSettings(loggedInUser.id)
      .then(raw => {
        const merged = deepMerge(JSON.parse(JSON.stringify(defaultSettings)), raw || {});
        setSettings(merged);
      })
      .catch(() => setApiError('Failed to load settings. Check backend connection.'))
      .finally(() => setLoadingSettings(false));
  }, [loggedInUser]);

  const handleLogout = () => {
    sessionStorage.removeItem('ap_user');
    setLoggedInUser(null);
    setSettings(JSON.parse(JSON.stringify(defaultSettings)));
  };

  if (!loggedInUser) {
    return <LoginScreen onLogin={setLoggedInUser} />;
  }

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setApiError('');
    try {
      await apiSaveSettings(loggedInUser.id, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setApiError('Save failed. Check backend connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset settings to defaults?')) return;
    await apiResetSettings(loggedInUser.id).catch(() => {});
    setSettings(JSON.parse(JSON.stringify(defaultSettings)));
    setSaved(false);
  };

  const handleExport = () => exportJSON(settings);

  const handleImport = async () => {
    try {
      const imported = await importJSON();
      const merged = deepMerge(JSON.parse(JSON.stringify(defaultSettings)), imported);
      setSettings(merged);
      setSaved(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderTab = () => {
    if (loadingSettings) return <div className="ap-loading">Loading settings...</div>;
    switch (activeTab) {
      case 'appearance': return <AppearanceSettings settings={settings} onChange={handleChange} />;
      case 'content':    return <ContentSettings    settings={settings} onChange={handleChange} />;
      case 'behavior':   return <BehaviorSettings   settings={settings} onChange={handleChange} />;
      case 'workflow':   return <WorkflowSettings   settings={settings} onChange={handleChange} />;
      case 'logs':       return <LogsSection        userId={loggedInUser.id} />;
      case 'script':     return <ScriptSettings     userId={loggedInUser.id} userName={loggedInUser.name} />;
      default:           return null;
    }
  };

  return (
    <div className="ap-root">
      <aside className="ap-sidebar">
        <div className="ap-logo">
          <span className="ap-logo-text">Chatbot Admin</span>
        </div>

        <div className="ap-user-section">
          <div className="ap-user-section-header">
            <span className="ap-group-title" style={{ margin: 0 }}>ACCOUNT</span>
          </div>
          <div className="ap-user-list">
            <div className="ap-user-item ap-user-item-active">
              <div className="ap-user-avatar">{loggedInUser.name[0].toUpperCase()}</div>
              <div className="ap-user-info">
                <div className="ap-user-name">{loggedInUser.name}</div>
                <div className="ap-user-email" style={{ fontFamily: 'monospace', fontSize: 10 }}>{loggedInUser.id.slice(0, 16)}...</div>
              </div>
            </div>
          </div>
        </div>

        <nav className="ap-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`ap-nav-item ${activeTab === tab.id ? 'ap-nav-item-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <button className="ap-btn ap-btn-export" onClick={handleExport}>Export JSON</button>
          <button className="ap-btn ap-btn-export" onClick={handleImport}>Import JSON</button>
          <button className="ap-btn ap-btn-reset"  onClick={handleReset}>Reset</button>
          <button className="ap-btn ap-btn-reset"  onClick={handleLogout} style={{ marginTop: 4 }}>Logout</button>
        </div>
      </aside>

      <main className="ap-main">
        <div className="ap-topbar">
          <div>
            <h1 className="ap-topbar-title">{loggedInUser.name}</h1>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontFamily: 'monospace' }}>
              ID: {loggedInUser.id}
            </div>
          </div>
          <button
            className={`ap-btn ap-btn-save ${saved ? 'ap-btn-saved' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {apiError && <div className="ap-error-banner">{apiError}</div>}

        <div className="ap-content">
          {renderTab()}
        </div>
      </main>

      <section className="ap-preview-panel">
        <div className="ap-preview-panel-header">
          <span>Live Preview</span>
          <div className="ap-preview-mode-toggle">
            <button
              className={`ap-preview-mode-btn${previewMode === 'desktop' ? ' active' : ''}`}
              onClick={() => setPreviewMode('desktop')}
              title="Desktop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3a2 2 0 00-2 2v12a2 2 0 002 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 002-2V4a2 2 0 00-2-2zm0 14H3V4h18v12z"/></svg>
            </button>
            <button
              className={`ap-preview-mode-btn${previewMode === 'mobile' ? ' active' : ''}`}
              onClick={() => setPreviewMode('mobile')}
              title="Mobile"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zm0 17H7V5h10v14zm-5 1a1 1 0 100-2 1 1 0 000 2z"/></svg>
            </button>
          </div>
        </div>
        <div className="ap-preview-panel-body">
          <WidgetPreview key={loggedInUser.id} settings={settings} userName={loggedInUser.name} previewMode={previewMode} />
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;