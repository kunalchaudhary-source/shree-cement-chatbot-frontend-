import React from 'react';

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="ap-toggle-row">
    <div>
      <div className="ap-label">{label}</div>
      {description && <div className="ap-hint">{description}</div>}
    </div>
    <label className="ap-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="ap-toggle-slider" />
    </label>
  </div>
);

const BehaviorSettings = ({ settings, onChange }) => {
  const b = settings.behavior;
  const set = (key, value) => onChange('behavior', key, value);

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">⚙️ Behavior</h2>

      <div className="ap-group">
        <h3 className="ap-group-title">Splash Screen</h3>
        <Toggle
          label="Show Splash Animation"
          description="Play the intro animation when the widget is first opened. Turn off to open chat directly."
          checked={b.splashEnabled !== false}
          onChange={v => set('splashEnabled', v)}
        />
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Visibility</h3>
        <Toggle
          label="Show Widget"
          description="Toggle the chatbot icon visibility on the page"
          checked={b.widgetVisible}
          onChange={v => set('widgetVisible', v)}
        />
        <Toggle
          label="Auto-Open on Load"
          description="Automatically open the chat window when the page loads"
          checked={b.autoOpen}
          onChange={v => set('autoOpen', v)}
        />
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Chat Window</h3>
        <Toggle
          label="Show Text Input"
          description="Show the message input box. Turn off for choice-button-only flows."
          checked={b.inputEnabled !== false}
          onChange={v => set('inputEnabled', v)}
        />
        <Toggle
          label="Show Close Button"
          description="Show the red X button on the trigger icon when the chat is open."
          checked={b.closeButtonVisible !== false}
          onChange={v => set('closeButtonVisible', v)}
        />
        <Toggle
          label="Show Timestamps"
          description="Display message timestamps in the chat window"
          checked={b.showTimestamps}
          onChange={v => set('showTimestamps', v)}
        />
        <Toggle
          label="Typing Indicator"
          description="Show animated dots while the bot is responding"
          checked={b.typingIndicatorEnabled}
          onChange={v => set('typingIndicatorEnabled', v)}
        />
        <div className="ap-field-row" style={{ marginTop: 8 }}>
          <label className="ap-label">Typing Duration (ms)</label>
          <input
            className="ap-text-input"
            type="number"
            min="0"
            max="10000"
            step="100"
            value={b.typingDuration ?? 1500}
            onChange={e => set('typingDuration', Number(e.target.value))}
          />
        </div>
        <div className="ap-hint" style={{ marginTop: 4 }}>Minimum time (ms) the typing dots show before the bot reply appears. 0 = instant.</div>
      </div>
    </div>
  );
};

export default BehaviorSettings;
