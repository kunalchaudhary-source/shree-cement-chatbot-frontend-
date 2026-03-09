import React, { useState } from 'react';

const WIDGET_URL = process.env.REACT_APP_WIDGET_URL || 'http://localhost:4000/chatbot-widget.js';

const ScriptSettings = ({ userId, userName: defaultUserName = '' }) => {
  const [copied, setCopied]       = useState(null);
  const [userName, setUserName]   = useState(defaultUserName);

  const buildScriptTag = () => {
    const lines = ['<script'];
    lines.push(`  src="${WIDGET_URL}"`);
    if (userId)   lines.push(`  data-user-id="${userId}"`);
    if (userName) lines.push(`  data-user-name="${userName}"`);
    lines.push('  data-auto-init="true"');
    lines.push('></script>');
    return lines.join('\n');
  };

  const buildJsInit = () => {
    const cfg = [];
    if (userId)   cfg.push(`  userId:   '${userId}'`);
    if (userName) cfg.push(`  userName: '${userName}'`);
    return [
      `<script src="${WIDGET_URL}"></script>`,
      '<script>',
      '  window.initChatbot({',
      ...cfg.map((l, i) => l + (i < cfg.length - 1 ? ',' : '')),
      '  });',
      '</script>',
    ].join('\n');
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const CodeBlock = ({ label, code, id }) => (
    <div className="ap-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="ap-group-title" style={{ marginBottom: 0 }}>{label}</h3>
        <button
          className={`ap-btn ${copied === id ? 'ap-btn-saved' : 'ap-btn-save'}`}
          style={{ padding: '6px 14px', fontSize: 13 }}
          onClick={() => copy(code, id)}
        >
          {copied === id ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <pre className="ap-code-block">{code}</pre>
    </div>
  );

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">🔗 Embed Script</h2>

      {!userId && (
        <div className="ap-info-banner">
          💡 Select a user in the sidebar to generate a personalised embed snippet with their <code>user-id</code>.
        </div>
      )}

      <div className="ap-group">
        <h3 className="ap-group-title">Embed Parameters</h3>

        {/* User ID */}
        <div className="ap-field-row" style={{ marginBottom: 10 }}>
          <label className="ap-label">User ID</label>
          <input
            className="ap-text-input"
            value={userId || '(no user selected)'}
            readOnly
            style={{ fontFamily: 'monospace', fontSize: 13, color: userId ? '#333' : '#aaa' }}
          />
          {userId && (
            <button
              className="ap-btn ap-btn-export"
              style={{ marginLeft: 8, whiteSpace: 'nowrap' }}
              onClick={() => copy(userId, 'uid')}
            >
              {copied === 'uid' ? '✓' : '📋'}
            </button>
          )}
        </div>

        {/* User Name */}
        <div className="ap-field-row">
          <label className="ap-label">User Name</label>
          <input
            className="ap-text-input"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="e.g. Rahul Sharma (optional)"
            style={{ fontSize: 13 }}
          />
          {userName && (
            <button
              className="ap-btn ap-btn-export"
              style={{ marginLeft: 8, whiteSpace: 'nowrap' }}
              onClick={() => setUserName('')}
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        <p className="ap-hint" style={{ marginTop: 8 }}>
          <code>data-user-name</code> is optional — when provided the chat widget shows the user's initials on their messages instead of "U".
        </p>
      </div>

      <CodeBlock
        id="script-tag"
        label="Option 1 — Single script tag (recommended)"
        code={buildScriptTag()}
      />

      <CodeBlock
        id="js-init"
        label="Option 2 — Manual initialisation (for SPAs)"
        code={buildJsInit()}
      />

      <div className="ap-group">
        <h3 className="ap-group-title">How it works</h3>
        <ol className="ap-steps-list">
          <li>Paste either snippet before <code>&lt;/body&gt;</code> on any page.</li>
          <li>The widget loads <strong>your saved settings</strong> from the API using the user ID.</li>
          <li>To update the look &amp; feel, change settings in the <em>Appearance</em> tab and click <strong>Save</strong> — no re-deployment needed.</li>
          <li>Different users (tenants) have isolated settings — each gets a unique ID.</li>
          <li><code>data-user-name</code> drives the circular avatar initial on user messages (e.g. "Rahul Sharma" → <strong>RS</strong>).</li>
        </ol>
      </div>
    </div>
  );
};

export default ScriptSettings;
