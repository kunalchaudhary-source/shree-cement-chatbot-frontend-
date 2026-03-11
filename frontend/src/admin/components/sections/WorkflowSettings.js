import React, { useState } from 'react';

const WorkflowSettings = ({ settings, onChange }) => {
  const w = settings.workflow || {};
  const set = (key, value) => onChange('workflow', key, value);

  const [showToken, setShowToken]       = useState(false);
  const [newOrigin, setNewOrigin]       = useState('');
  const allowedOrigins = Array.isArray(w.allowedOrigins) ? w.allowedOrigins : [];

  const addOrigin = () => {
    const val = newOrigin.trim().replace(/\/+$/, ''); // strip trailing slash
    if (!val || allowedOrigins.includes(val)) { setNewOrigin(''); return; }
    set('allowedOrigins', [...allowedOrigins, val]);
    setNewOrigin('');
  };

  const removeOrigin = (idx) => {
    set('allowedOrigins', allowedOrigins.filter((_, i) => i !== idx));
  };

  const apiBaseUrl  = w.apiBaseUrl  || 'http://localhost:3001/api/v1';
  const typebotId   = w.typebotId   || '';
  const bearerToken = w.bearerToken || '';

  const startUrl    = `${apiBaseUrl}/typebots/${typebotId}/preview/startChat`;
  const continueUrl = `${apiBaseUrl}/sessions/<sessionId>/continueChat`;

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">⚙️ Workflow Setup</h2>

      {/* ── Typebot API ── */}
      <div className="ap-group">
        <h3 className="ap-group-title">Typebot API</h3>
        <p className="ap-hint" style={{ marginBottom: 12 }}>
          Configure the Typebot server your chatbot talks to. Changes are saved with your other settings and applied instantly when the widget loads.
        </p>

        <div className="ap-field-col">
          <label className="ap-label">API Base URL</label>
          <input
            className="ap-text-input"
            value={apiBaseUrl}
            onChange={e => set('apiBaseUrl', e.target.value)}
            placeholder="http://localhost:3001/api/v1"
            spellCheck={false}
          />
          <span className="ap-hint" style={{ marginTop: 4 }}>
            The root URL of your Typebot server (no trailing slash).
          </span>
        </div>

        <div className="ap-field-col" style={{ marginTop: 14 }}>
          <label className="ap-label">Typebot ID</label>
          <input
            className="ap-text-input"
            value={typebotId}
            onChange={e => set('typebotId', e.target.value)}
            placeholder="e.g. n7r13wu6szxrc82w46klq78e"
            spellCheck={false}
          />
          <span className="ap-hint" style={{ marginTop: 4 }}>
            The ID or slug of the published / preview typebot.
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

      {/* ── Endpoint Reference ── */}
      <div className="ap-group">
        <h3 className="ap-group-title">Endpoint Reference</h3>
        <p className="ap-hint" style={{ marginBottom: 12 }}>
          These are the two endpoints the widget uses, built from your values above.
        </p>

        <div className="ap-field-col">
          <label className="ap-label">Start Chat <span style={{ color: '#888', fontWeight: 400 }}>(POST)</span></label>
          <div
            style={{
              background: '#f5f7ff',
              border: '1px solid #e0e4f0',
              borderRadius: 8,
              padding: '10px 12px',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#1a1a2e',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}
          >
            {startUrl}
          </div>
          <span className="ap-hint" style={{ marginTop: 4 }}>
            Initialises a new session. The response contains a <code>sessionId</code>.
          </span>
        </div>

        <div className="ap-field-col" style={{ marginTop: 14 }}>
          <label className="ap-label">Continue Chat <span style={{ color: '#888', fontWeight: 400 }}>(POST)</span></label>
          <div
            style={{
              background: '#f5f7ff',
              border: '1px solid #e0e4f0',
              borderRadius: 8,
              padding: '10px 12px',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#1a1a2e',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}
          >
            {continueUrl}
          </div>
          <span className="ap-hint" style={{ marginTop: 4 }}>
            Send subsequent user messages using the <code>sessionId</code> from the first response.
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
