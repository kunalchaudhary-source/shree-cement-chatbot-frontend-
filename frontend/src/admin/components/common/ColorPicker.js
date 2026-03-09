import React from 'react';

const ColorPicker = ({ label, value, onChange }) => {
  return (
    <div className="ap-color-row">
      <label className="ap-label">{label}</label>
      <div className="ap-color-wrap">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="ap-color-input"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="ap-text-input ap-hex-input"
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
