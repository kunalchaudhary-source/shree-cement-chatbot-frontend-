import React, { useState, useEffect, useCallback } from 'react';
import { apiGetLogs, apiDeleteLogs } from '../../utils/api';

const fmt = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString();
};

const LogsSection = ({ userId }) => {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deleting, setDeleting]   = useState(false);
  const [expanded, setExpanded]   = useState({});

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetLogs(userId);
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all chat logs for this account? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const result = await apiDeleteLogs(userId);
      setSessions([]);
      alert(`Deleted ${result.deleted} log entr${result.deleted === 1 ? 'y' : 'ies'}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleSession = (sid) =>
    setExpanded(prev => ({ ...prev, [sid]: !prev[sid] }));

  if (loading) return <div className="ap-loading">Loading logs...</div>;

  return (
    <div className="ap-section">
      <div className="ap-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ap-section-title">Chat Logs</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="ap-btn" onClick={loadLogs} style={{ padding: '6px 14px' }}>
            Refresh
          </button>
          <button
            className="ap-btn ap-btn-reset"
            onClick={handleDeleteAll}
            disabled={deleting || sessions.length === 0}
            style={{ padding: '6px 14px' }}
          >
            {deleting ? 'Deleting...' : 'Clear All Logs'}
          </button>
        </div>
      </div>

      {error && <div className="ap-error-banner" style={{ marginBottom: 12 }}>{error}</div>}

      {sessions.length === 0 ? (
        <div style={{ color: '#888', padding: '24px 0', textAlign: 'center' }}>
          No chat logs yet. Start a conversation on the widget to see logs here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
          </div>
          {sessions.map((session, idx) => {
            const isOpen = expanded[session.session_id] !== false; // expanded by default
            const msgCount = session.messages.length;
            return (
              <div key={session.session_id} style={{
                border: '1px solid #e2e6ea',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#fff',
              }}>
                {/* Session header */}
                <button
                  onClick={() => toggleSession(session.session_id)}
                  style={{
                    width: '100%',
                    background: '#f8f9fa',
                    border: 'none',
                    borderBottom: isOpen ? '1px solid #e2e6ea' : 'none',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    Session #{sessions.length - idx}
                  </span>
                  <span style={{ display: 'flex', gap: 16, color: '#888', fontSize: 12 }}>
                    <span>{fmt(session.started_at)}</span>
                    <span>{msgCount} message{msgCount !== 1 ? 's' : ''}</span>
                    <span>{isOpen ? '▲ Collapse' : '▼ Expand'}</span>
                  </span>
                </button>

                {/* Messages */}
                {isOpen && (
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {session.messages.map(msg => (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                          gap: 8,
                          alignItems: 'flex-start',
                        }}
                      >
                        {/* Avatar pill */}
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: msg.sender === 'user' ? '#667eea' : '#e2e6ea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: msg.sender === 'user' ? '#fff' : '#555',
                          flexShrink: 0,
                        }}>
                          {msg.sender === 'user' ? 'U' : 'B'}
                        </div>
                        {/* Bubble */}
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{
                            background: msg.sender === 'user' ? '#667eea' : '#f0f2f5',
                            color:      msg.sender === 'user' ? '#fff'    : '#333',
                            borderRadius: msg.sender === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                            padding: '8px 12px',
                            fontSize: 13,
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}>
                            {msg.message}
                          </div>
                          <div style={{ fontSize: 10, color: '#aaa', marginTop: 3, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                            {fmt(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LogsSection;
