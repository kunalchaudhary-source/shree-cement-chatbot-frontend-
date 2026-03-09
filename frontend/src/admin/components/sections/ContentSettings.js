import React from 'react';

const ContentSettings = ({ settings, onChange }) => {
  const c = settings.content;
  const set = (key, value) => onChange('content', key, value);

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">✏️ Content</h2>

      <div className="ap-group">
        <h3 className="ap-group-title">Assistant Identity</h3>
        <div className="ap-field-row">
          <label className="ap-label">Assistant Name</label>
          <input
            className="ap-text-input"
            value={c.assistantName}
            onChange={e => set('assistantName', e.target.value)}
            placeholder="Chat Assistant"
          />
        </div>
        <div className="ap-field-row">
          <label className="ap-label">Tagline</label>
          <input
            className="ap-text-input"
            value={c.tagline || ''}
            onChange={e => set('tagline', e.target.value)}
            placeholder="Your go-to help for all queries."
          />
        </div>
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Messages</h3>
        <div className="ap-field-col">
          <label className="ap-label">Greeting Message</label>
          <textarea
            className="ap-textarea"
            value={c.greetingMessage}
            onChange={e => set('greetingMessage', e.target.value)}
            rows={3}
            placeholder="Hello! How can I help you today?"
          />
        </div>
        <div className="ap-field-col">
          <label className="ap-label">Error Message</label>
          <textarea
            className="ap-textarea"
            value={c.errorMessage}
            onChange={e => set('errorMessage', e.target.value)}
            rows={3}
            placeholder="Sorry, I'm having trouble connecting. Please try again later."
          />
        </div>
        <div className="ap-field-row">
          <label className="ap-label">Input Placeholder</label>
          <input
            className="ap-text-input"
            value={c.inputPlaceholder}
            onChange={e => set('inputPlaceholder', e.target.value)}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
};

export default ContentSettings;
