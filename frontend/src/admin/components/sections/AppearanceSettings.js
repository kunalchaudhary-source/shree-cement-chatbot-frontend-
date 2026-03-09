import React from 'react';
import ColorPicker from '../common/ColorPicker';
import { ICON_OPTIONS } from '../../../utils/icons';
import mascotImgSrc    from '../../../../resources/Group 123266.png';
import defaultAvatarSrc from '../../../../resources/Group 123266 (1).png';

const AppearanceSettings = ({ settings, onChange }) => {
  const a = settings.appearance;

  const set = (key, value) => onChange('appearance', key, value);

  return (
    <div className="ap-section">
      <h2 className="ap-section-title">🎨 Appearance</h2>

      <div className="ap-group">
        <h3 className="ap-group-title">Gradient Colors</h3>
        <ColorPicker label="Primary Color"   value={a.primaryColor}   onChange={v => set('primaryColor', v)} />
        <ColorPicker label="Secondary Color" value={a.secondaryColor} onChange={v => set('secondaryColor', v)} />
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">"Hello!!" Text Gradient</h3>
        <p className="ap-hint" style={{ marginBottom: 10 }}>Controls the gradient on the "Hello!!" heading in the chat header.</p>
        <ColorPicker label="From Color" value={a.helloGradientStart || '#8724FF'} onChange={v => set('helloGradientStart', v)} />
        <ColorPicker label="To Color"   value={a.helloGradientEnd   || '#155CFF'} onChange={v => set('helloGradientEnd',   v)} />
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Accent Gradient (SS Bubble &amp; Close Button)</h3>
        <p className="ap-hint" style={{ marginBottom: 10 }}>Controls the gradient on the bot avatar (SS) and the close × button.</p>
        <ColorPicker label="From Color" value={a.accentGradientStart || '#012C8F'} onChange={v => set('accentGradientStart', v)} />
        <ColorPicker label="To Color"   value={a.accentGradientEnd   || '#001F63'} onChange={v => set('accentGradientEnd',   v)} />
      </div>

      {/* Splash Screen */}
      <div className="ap-group">
        <h3 className="ap-group-title">Splash Screen</h3>
        <p className="ap-hint" style={{ marginBottom: 10 }}>Background gradient and mascot shown when the widget is first opened.</p>
        <ColorPicker label="Background From" value={a.splashGradientStart || '#BD67FF'} onChange={v => set('splashGradientStart', v)} />
        <ColorPicker label="Background To"   value={a.splashGradientEnd   || '#2E4FDF'} onChange={v => set('splashGradientEnd',   v)} />

        {/* Splash mascot upload */}
        <div className="ap-field-row" style={{ marginTop: 12 }}>
          <label className="ap-label">Splash Mascot Image</label>
        </div>
        <div
          className="ap-upload-zone"
          style={{ marginTop: 6 }}
          onClick={() => document.getElementById('ap-splash-mascot-upload').click()}
        >
          <input
            id="ap-splash-mascot-upload"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files[0];
              if (!file) return;
              if (file.size > 512 * 1024) { alert('Image must be smaller than 512 KB.'); return; }
              const reader = new FileReader();
              reader.onload = ev => set('splashMascotUrl', ev.target.result);
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
          />
          {a.splashMascotUrl ? (
            <div className="ap-upload-preview">
              <img src={a.splashMascotUrl} alt="splash mascot" style={{ width: 60, height: 60, objectFit: 'contain' }} />
              <div className="ap-upload-preview-actions">
                <span className="ap-upload-hint">Click to replace</span>
                <button
                  className="ap-upload-remove"
                  onClick={e => { e.stopPropagation(); set('splashMascotUrl', ''); }}
                >✕ Remove</button>
              </div>
            </div>
          ) : (
            <div className="ap-upload-empty">
              <img src={mascotImgSrc} alt="default mascot" style={{ width: 48, height: 48, objectFit: 'contain', opacity: 0.5 }} />
              <p>Click to upload custom mascot</p>
              <span>PNG, JPG, SVG, WebP · max 512 KB</span>
            </div>
          )}
        </div>
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Bubble Colors</h3>
        <ColorPicker label="Bot Bubble"  value={a.botBubbleColor} onChange={v => set('botBubbleColor', v)} />
        <ColorPicker label="Bot Text"    value={a.botTextColor}   onChange={v => set('botTextColor', v)} />
        <ColorPicker label="Bot Avatar (SS)" value={a.botAvatarColor || '#012A89'} onChange={v => set('botAvatarColor', v)} />
        <ColorPicker label="User Text"   value={a.userTextColor}  onChange={v => set('userTextColor', v)} />
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Header Text &amp; Typing Dots</h3>
        <p className="ap-hint" style={{ marginBottom: 10 }}>Controls the "I'm ..." name and tagline text color, and the typing dots color.</p>
        <ColorPicker label="Name &amp; Tagline Color" value={a.headerNameColor || '#000000'} onChange={v => set('headerNameColor', v)} />
        <ColorPicker label="Typing Dots Color"       value={a.typingDotsColor || '#012A89'}  onChange={v => set('typingDotsColor', v)} />
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Header</h3>
        <ColorPicker label="Header Text Color" value={a.headerTextColor} onChange={v => set('headerTextColor', v)} />
        <div className="ap-field-row">
          <label className="ap-label">Status Text</label>
          <input
            className="ap-text-input"
            value={a.statusText}
            onChange={e => set('statusText', e.target.value)}
            placeholder="Online"
          />
        </div>
      </div>

      {/* Chat Icon */}
      <div className="ap-group">
        <h3 className="ap-group-title">Chat Icon</h3>
        <p className="ap-hint" style={{ marginBottom: 12 }}>Choose how the trigger button looks.</p>
        <div className="ap-icon-picker">

          {/* Ask button (default) */}
          <button
            className={`ap-icon-option ${ (a.iconType || 'ask') === 'ask' ? 'ap-icon-option-active' : '' }`}
            onClick={() => { set('iconType', 'ask'); set('customIconUrl', ''); }}
            title="Ask button"
            style={(a.iconType || 'ask') === 'ask' ? { borderColor: a.primaryColor } : {}}
          >
            <svg width="28" height="28" viewBox="0 0 72 72" fill="none">
              <defs>
                <linearGradient id="apAskGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#C87F85" />
                  <stop offset="50%"  stopColor="#68D4FD" />
                  <stop offset="100%" stopColor="#566ABD" />
                </linearGradient>
              </defs>
              <circle cx="36" cy="36" r="32" fill="white" stroke="url(#apAskGrad)" strokeWidth="5" />
              <text x="36" y="42" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1a237e">A</text>
            </svg>
            <span className="ap-icon-label">Ask</span>
          </button>

          {/* Mascot image */}
          <button
            className={`ap-icon-option ${ a.iconType === 'mascot' ? 'ap-icon-option-active' : '' }`}
            onClick={() => { set('iconType', 'mascot'); set('customIconUrl', ''); }}
            title="Mascot"
            style={a.iconType === 'mascot' ? { borderColor: a.primaryColor } : {}}
          >
            <img src={mascotImgSrc} alt="mascot" width="28" height="28" style={{ objectFit: 'contain' }} />
            <span className="ap-icon-label">Mascot</span>
          </button>

          {/* Legacy SVG icons */}
          {ICON_OPTIONS.map(icon => {
            const selected = a.iconType === icon.id;
            return (
              <button
                key={icon.id}
                className={`ap-icon-option ${selected ? 'ap-icon-option-active' : ''}`}
                onClick={() => { set('iconType', icon.id); set('customIconUrl', ''); }}
                title={icon.label}
                style={selected ? { borderColor: a.primaryColor } : {}}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={selected ? a.primaryColor : '#555'}>
                  <path d={icon.path} />
                </svg>
                <span className="ap-icon-label">{icon.label}</span>
              </button>
            );
          })}

          {/* Custom upload */}
          <button
            className={`ap-icon-option ${ a.iconType === 'custom' ? 'ap-icon-option-active' : '' }`}
            onClick={() => set('iconType', 'custom')}
            title="Custom image"
            style={a.iconType === 'custom' ? { borderColor: a.primaryColor } : {}}
          >
            {a.customIconUrl
              ? <img src={a.customIconUrl} alt="custom" width="28" height="28" style={{ objectFit: 'contain', borderRadius: 3 }} />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="#555"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" /></svg>
            }
            <span className="ap-icon-label">Custom</span>
          </button>
        </div>

        {a.iconType === 'custom' && (
          <div className="ap-upload-zone" onClick={() => document.getElementById('ap-icon-upload').click()}>
            <input
              id="ap-icon-upload"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 512 * 1024) { alert('Image must be smaller than 512 KB.'); return; }
                const reader = new FileReader();
                reader.onload = ev => { set('customIconUrl', ev.target.result); };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
            {a.customIconUrl ? (
              <div className="ap-upload-preview">
                <img src={a.customIconUrl} alt="custom icon" />
                <div className="ap-upload-preview-actions">
                  <span className="ap-upload-hint">Click to replace</span>
                  <button className="ap-upload-remove" onClick={e => { e.stopPropagation(); set('customIconUrl', ''); }}>✕ Remove</button>
                </div>
              </div>
            ) : (
              <div className="ap-upload-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#aaa"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" /></svg>
                <p>Click to upload image</p>
                <span>PNG, JPG, SVG, WebP · max 512 KB</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Avatar */}
      <div className="ap-group">
        <h3 className="ap-group-title">Header Avatar</h3>
        <p className="ap-hint" style={{ marginBottom: 12 }}>Icon shown next to the assistant name in the chat header.</p>
        <div className="ap-icon-picker">

          {/* Default bundled image */}
          <button
            className={`ap-icon-option ${ (a.avatarIconType || 'default') === 'default' ? 'ap-icon-option-active' : '' }`}
            onClick={() => { set('avatarIconType', 'default'); set('avatarCustomIconUrl', ''); }}
            title="Default avatar"
            style={(a.avatarIconType || 'default') === 'default' ? { borderColor: a.primaryColor } : {}}
          >
            <img src={defaultAvatarSrc} alt="default avatar" width="28" height="28" style={{ objectFit: 'contain' }} />
            <span className="ap-icon-label">Default</span>
          </button>

          {/* Legacy SVG icons */}
          {ICON_OPTIONS.map(icon => {
            const selected = (a.avatarIconType || 'default') === icon.id;
            return (
              <button
                key={icon.id}
                className={`ap-icon-option ${selected ? 'ap-icon-option-active' : ''}`}
                onClick={() => { set('avatarIconType', icon.id); set('avatarCustomIconUrl', ''); }}
                title={icon.label}
                style={selected ? { borderColor: a.primaryColor } : {}}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={selected ? a.primaryColor : '#555'}>
                  <path d={icon.path} />
                </svg>
                <span className="ap-icon-label">{icon.label}</span>
              </button>
            );
          })}

          {/* Custom upload */}
          <button
            className={`ap-icon-option ${ (a.avatarIconType || 'default') === 'custom' ? 'ap-icon-option-active' : '' }`}
            onClick={() => { set('avatarIconType', 'custom'); document.getElementById('ap-avatar-upload-hidden').click(); }}
            title="Custom image"
            style={(a.avatarIconType || 'default') === 'custom' ? { borderColor: a.primaryColor } : {}}
          >
            {a.avatarCustomIconUrl
              ? <img src={a.avatarCustomIconUrl} alt="custom" width="28" height="28" style={{ objectFit: 'contain', borderRadius: 3 }} />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="#555"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" /></svg>
            }
            <span className="ap-icon-label">Custom</span>
          </button>
        </div>

        <input
          id="ap-avatar-upload-hidden"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 512 * 1024) { alert('Image must be smaller than 512 KB.'); return; }
            const reader = new FileReader();
            reader.onload = ev => { set('avatarCustomIconUrl', ev.target.result); set('avatarIconType', 'custom'); };
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
        />

        {a.avatarCustomIconUrl && (
          <div className="ap-upload-preview" style={{ marginTop: 10, padding: '8px 12px', background: '#f8f9fa', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={a.avatarCustomIconUrl} alt="avatar" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6 }} />
            <div style={{ flex: 1 }}><div className="ap-upload-hint">Custom avatar active</div></div>
            <button className="ap-upload-remove" onClick={() => { set('avatarCustomIconUrl', ''); set('avatarIconType', 'default'); }}>✕ Remove</button>
          </div>
        )}
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Position</h3>
        <div className="ap-field-row">
          <label className="ap-label">Widget Position (Desktop)</label>
          <select className="ap-select" value={a.position || 'bottom-right'} onChange={e => set('position', e.target.value)}>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
          </select>
        </div>
        <div className="ap-field-row" style={{ marginTop: 10 }}>
          <label className="ap-label">Widget Position (Mobile)</label>
          <select className="ap-select" value={a.mobilePosition || 'top-right'} onChange={e => set('mobilePosition', e.target.value)}>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
          </select>
        </div>
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Ask Button</h3>
        <div className="ap-toggle-row">
          <div>
            <div className="ap-label">Breathing Animation</div>
            <div className="ap-hint">Gently pulses the Ask button to draw attention</div>
          </div>
          <label className="ap-toggle">
            <input
              type="checkbox"
              checked={a.askButtonBreathing !== false}
              onChange={e => set('askButtonBreathing', e.target.checked)}
            />
            <span className="ap-toggle-slider" />
          </label>
        </div>
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Choice Buttons</h3>
        <div className="ap-toggle-row" style={{ marginBottom: 10 }}>
          <div>
            <div className="ap-label">Dynamic Button Size</div>
            <div className="ap-hint">Each button sizes itself to its text. Turn off for full-width buttons.</div>
          </div>
          <label className="ap-toggle">
            <input
              type="checkbox"
              checked={a.dynamicChoiceSize !== false}
              onChange={e => set('dynamicChoiceSize', e.target.checked)}
            />
            <span className="ap-toggle-slider" />
          </label>
        </div>
        <ColorPicker label="Active Color (selected fill)"  value={a.choiceActiveColor || '#0032A1'} onChange={v => set('choiceActiveColor', v)} />
        <ColorPicker label="Dim Color (unselected after pick)" value={a.choiceDimColor || '#B6B6B6'} onChange={v => set('choiceDimColor', v)} />
        <div style={{ marginTop: 10 }}>
          <ColorPicker label="User Bubble Color" value={a.userBubbleColor || '#0032A1'} onChange={v => set('userBubbleColor', v)} />
        </div>
      </div>

      <div className="ap-group">
        <h3 className="ap-group-title">Chat Background</h3>
        <ColorPicker label="Accent Color" value={a.chatBgAccentColor || '#ACC5FF'} onChange={v => set('chatBgAccentColor', v)} />
        <p className="ap-hint" style={{ marginTop: 6 }}>Used in the diagonal chat gradient: <code>linear-gradient(175.38deg, color -6.21%, #FFF 21.5%, #FFF 74.69%, color 105.39%)</code>.</p>
      </div>
    </div>
  );
};

export default AppearanceSettings;
