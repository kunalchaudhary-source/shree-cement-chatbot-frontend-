import React, { useState } from 'react';

const WorkflowSettings = ({ settings, onChange }) => {
  const w = settings.workflow || {};
  const set = (key, value) => onChange('workflow', key, value);

  const [showToken, setShowToken] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const allowedOrigins = Array.isArray(w.allowedOrigins) ? w.allowedOrigins : [];

  const addOrigin = () => {
    const val = newOrigin.trim().replace(/\/+$/, '');
    if (!val || allowedOrigins.includes(val)) { setNewOrigin(''); return; }
    set('allowedOrigins', [...allowedOrigins, val]);
    setNewOrigin('');
  };

  const removeOrigin = (idx) => {
    set('allowedOrigins', allowedOrigins.filter((_, i) => i !== idx));
  };

  const startChatUrl   = w.startChatUrl   || '';
  const continueChatUrl = w.continueChatUrl || '';
  const bearerToken    = w.bearerToken    || '';

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">⚙️ Workflow Setup</h2>

      {/* ── Typebot API ── */}
      <div className="ap-group">
        <h3 className="ap-group-title">Typebot API</h3>
        <p className="ap-hint" style={{ marginBottom: 12 }}>
          Paste the full endpoint URLs directly. Changes are saved with your other settings and applied instantly when the widget loads.
        </p>

        <div className="ap-field-col">
          <label className="ap-label">Start Chat URL <span style={{ color: '#888', fontWeight: 400 }}>(POST)</span></label>
          <input
            className="ap-text-input"
            value={startChatUrl}
            onChange={e => set('startChatUrl', e.target.value)}
            placeholder="https://your-typebot.com/api/v1/typebots/YOUR_ID/startChat"
            spellCheck={false}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
          <span className="ap-hint" style={{ marginTop: 4 }}>
            Called once to initialise the session. The response returns a <code>sessionId</code>.
          </span>
        </div>

        <div className="ap-field-col" style={{ marginTop: 14 }}>
          <label className="ap-label">Continue Chat URL <span style={{ color: '#888', fontWeight: 400 }}>(POST)</span></label>
          <input
            className="ap-text-input"
            value={continueChatUrl}
            onChange={e => set('continueChatUrl', e.target.value)}
            placeholder="https://your-typebot.com/api/v1/sessions/<SESSION_ID>/continueChat"
            spellCheck={false}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
          <span className="ap-hint" style={{ marginTop: 4 }}>
            The widget replaces <code>&lt;SESSION_ID&gt;</code> with the actual session ID at runtime.
          </span>
        </div>

        <div className="ap-field-col" style={{ marginTop: 14 }}>
          <label className="ap-label">API Bearer Token</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              className="ap-text-input"
              type={showToken ? 'text' : 'password'}
              value={bearerToken}
              onChange={e => set('bearerToken', e.target.value)}
              placeholder="Paste token here…"
              spellCheck={false}
              style={{ flex: 1, fontFamily: 'monospace', letterSpacing: showToken ? 0 : 2 }}
            />
            <button
              type="button"
              className="ap-btn ap-btn-reset"
              style={{ padding: '6px 12px', fontSize: 12, flex: 'none' }}
              onClick={() => setShowToken(v => !v)}
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="ap-hint" style={{ marginTop: 4 }}>
            Sent as <code>Authorization: Bearer &lt;token&gt;</code> on every request.
          </span>
        </div>
      </div>

      {/* ── Allowed Origins (widget whitelist) ── */}
      <div className="ap-group">
        <h3 className="ap-group-title">🔒 Allowed Domains (Whitelist)</h3>
        <p className="ap-hint" style={{ marginBottom: 12 }}>
          When this list is <strong>empty</strong> the widget loads on <em>any</em> website.
          Add one or more origins below to restrict it to those domains only.
          Use the full origin: <code>https://example.com</code> (no trailing slash, no path).
        </p>

        {/* existing entries */}
        {allowedOrigins.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 12 }}>
            {allowedOrigins.map((o, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 8,
                background: '#f0f4ff', border: '1px solid #d0d8f0',
                marginBottom: 6, fontFamily: 'monospace', fontSize: 13,
              }}>
                <span style={{ flex: 1, wordBreak: 'break-all', color: '#1a1a2e' }}>{o}</span>
                <button
                  className="ap-btn ap-btn-reset"
                  style={{ padding: '3px 10px', fontSize: 12, flex: 'none' }}
                  onClick={() => removeOrigin(i)}
                >✕ Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: '#fffbe6', border: '1px solid #ffe58f',
            fontSize: 12, color: '#7d5a00', marginBottom: 12,
          }}>
            ⚠️ No restrictions — widget will load on <strong>all</strong> websites.
          </div>
        )}

        {/* add new entry */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="ap-text-input"
            value={newOrigin}
            onChange={e => setNewOrigin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addOrigin()}
            placeholder="https://your-website.com"
            spellCheck={false}
            style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button
            className="ap-btn ap-btn-save"
            style={{ flex: 'none', padding: '8px 16px' }}
            onClick={addOrigin}
          >+ Add</button>
        </div>
        <span className="ap-hint" style={{ marginTop: 6 }}>
          Press Enter or click Add. Example: <code>https://sclchatbot.digiiq.ai</code>
        </span>
      </div>
    </div>
  );
};

export default WorkflowSettings;
