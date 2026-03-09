import React, { useState } from 'react';
import headerAvatar  from '../../../../resources/Group 123266 (1).png';
import mascotImgSrc  from '../../../../resources/Group 123266.png';
import { getIconPath } from '../../../utils/icons';

const WidgetPreview = ({ settings, userName = '', previewMode = 'desktop' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const { appearance, content } = settings;

  // Derive user initials from logged-in name
  const userInitial = (() => {
    if (!userName) return 'U';
    const parts = userName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : userName.slice(0, 2).toUpperCase();
  })();

  const gradient = `linear-gradient(135deg, ${appearance.primaryColor} 0%, ${appearance.secondaryColor} 100%)`;
  const helloGradient   = `linear-gradient(91.72deg, ${appearance.helloGradientStart  || '#8724FF'} 1.46%, ${appearance.helloGradientEnd  || '#155CFF'} 32.31%)`;
  const accentGradient  = `linear-gradient(135deg, ${appearance.accentGradientStart || '#012C8F'} 0%, ${appearance.accentGradientEnd || '#001F63'} 100%)`;
  const botAvatarColor  = appearance.botAvatarColor || '#012A89';
  const userBubbleColor   = appearance.userBubbleColor   || '#0032A1';
  const choiceActiveColor  = appearance.choiceActiveColor  || '#0032A1';
  const choiceDimColor     = appearance.choiceDimColor     || '#B6B6B6';
  const dynamicChoices     = appearance.dynamicChoiceSize  !== false;
  const chatBgAccentColor  = appearance.chatBgAccentColor  || '#ACC5FF';
  const headerNameColor    = appearance.headerNameColor    || '#000000';
  const typingDotsColor    = appearance.typingDotsColor    || '#012A89';
  const chatBg = `linear-gradient(to bottom, ${chatBgAccentColor} 0%, #ffffff 45%, #ffffff 55%, ${chatBgAccentColor} 100%)`;

  const sampleMessages = [
    { type: 'bot',  text: content.greetingMessage || 'Hello! How can I help you today?' },
    { type: 'user', text: 'My Earnings' },
    { type: 'bot',  text: 'What would you like to know more about?' },
  ];

  const choices = ['View my current earnings', 'Go to main menu'];

  // Derive initials
  const nameWords = (content.assistantName || 'Chat Assistant').split(' ');
  const initials  = nameWords.length >= 2
    ? (nameWords[0][0] + nameWords[1][0]).toUpperCase()
    : (content.assistantName || 'CA').slice(0, 2).toUpperCase();

  const breathe  = appearance.askButtonBreathing !== false;
  const iconType  = appearance.iconType || 'ask';

  if (!settings.behavior.widgetVisible) {
    return (
      <div className="ap-preview-hidden">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#aaa">
          <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
        <p>Widget is hidden</p>
      </div>
    );
  }

  const pos = appearance.position || 'bottom-right';
  const isTop  = pos.startsWith('top');
  const isLeft = pos.endsWith('left');
  const posStyle = {
    ...(isTop  ? { top: 20, bottom: 'auto' } : { bottom: 20, top: 'auto' }),
    ...(isLeft ? { left: 20, right: 'auto' } : { right: 20, left: 'auto' }),
  };

  // ── MOBILE PREVIEW ──────────────────────────────────────────────
  if (previewMode === 'mobile') {
    const mpos = appearance.mobilePosition || 'top-right';
    const mIsTop  = mpos.startsWith('top');
    const mIsLeft = mpos.endsWith('left');
    const askPos = {
      position: 'absolute',
      ...(mIsTop  ? { top: 12 }    : { bottom: 12 }),
      ...(mIsLeft ? { left: 12 }   : { right: 12 }),
    };
    return (
      <div className="ap-phone-frame">
        <div className="ap-phone-notch" />
        <div className="ap-phone-screen">
          {/* Mock page background */}
          <div className="ap-phone-page" />

          {/* Fullscreen chat window */}
          {isOpen && (
            <div
              className="ss-window"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 16, '--chat-bg': chatBg, '--header-name-color': headerNameColor, '--typing-dot-color': typingDotsColor }}
            >
              <div className="ss-header">
                <div className="ss-hdr-row">
                  <div className="ss-hdr-avatar">
                    {appearance.avatarCustomIconUrl
                      ? <img src={appearance.avatarCustomIconUrl} alt="avatar" className="ss-hdr-avatar-img" />
                      : (appearance.avatarIconType && appearance.avatarIconType !== 'default')
                        ? <div className="ss-hdr-avatar-initials" style={{ background: gradient }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d={getIconPath(appearance.avatarIconType)} /></svg></div>
                        : <img src={headerAvatar} alt="avatar" className="ss-hdr-avatar-img" />
                    }
                  </div>
                  <div className="ss-hello" style={{ backgroundImage: helloGradient, fontWeight: 800 }}>Hello!!</div>
                  <button className="ss-close" style={{ background: accentGradient }} onClick={() => setIsOpen(false)}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                <div className="ss-hdr-name">I'm <strong>{content.assistantName || 'Chat Assistant'}</strong></div>
                <div className="ss-hdr-tagline">{content.tagline || 'Your go-to help for all queries.'}</div>
              </div>
              <div className="ss-messages">
                {sampleMessages.map((msg, i) => (
                  <div key={i} className={`ss-msg ${msg.type === 'user' ? 'ss-msg-user' : 'ss-msg-bot'}`}>
                    {msg.type === 'bot' && <div className="ss-msg-avatar" style={{ background: botAvatarColor }}>{initials}</div>}
                    <div className={`ss-bubble ${msg.type === 'user' ? 'ss-bubble-user' : 'ss-bubble-bot'}`}
                      style={msg.type === 'user'
                        ? { background: userBubbleColor, color: appearance.userTextColor || '#fff' }
                        : { '--bot-bubble-bg': appearance.botBubbleColor || '#EFEFEF', '--bot-bubble-color': appearance.botTextColor || '#1a1a2e' }}
                    >{msg.text}</div>
                    {msg.type === 'user' && <div className="ss-msg-user-avatar" style={{ background: accentGradient }}>{userInitial}</div>}
                  </div>
                ))}
                <div className="ss-msg ss-msg-user" style={{ alignItems: 'flex-start' }}>
                  <div className={`ss-choices${dynamicChoices ? ' ss-choices-dynamic' : ''}`}>
                    {choices.map((c, i) => {
                      const isSel = selectedChoice === c;
                      const hasSel = selectedChoice !== null;
                      const s = isSel
                        ? { '--btn-bg': choiceActiveColor, '--btn-color': '#fff', '--btn-border': choiceActiveColor }
                        : hasSel
                          ? { '--btn-bg': '#fff', '--btn-color': choiceDimColor, '--btn-border': choiceDimColor }
                          : { '--btn-bg': '#fff', '--btn-color': choiceActiveColor, '--btn-border': choiceActiveColor };
                      return <button key={i} className="ss-choice-btn" onClick={() => setSelectedChoice(isSel ? null : c)} style={s}>{c}</button>;
                    })}
                  </div>
                  <div className="ss-msg-user-avatar" style={{ background: accentGradient, flexShrink: 0, alignSelf: 'flex-start' }}>{userInitial}</div>
                </div>
              </div>
              <form className="ss-form" onSubmit={e => e.preventDefault()}>
                <input className="ss-input" placeholder={content.inputPlaceholder || 'Type your message...'} readOnly />
                <button type="submit" className="ss-send" style={{ background: accentGradient }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
                </button>
              </form>
            </div>
          )}

          {/* Ask button — hidden when chat is open on mobile */}
          {!isOpen && (
            <div style={askPos}>
              <div className={`ask-icon-wrap${breathe ? ' ask-breathing' : ''}`} onClick={() => setIsOpen(true)} style={{ transform: 'scale(0.6)', transformOrigin: mIsTop ? (mIsLeft ? 'top left' : 'top right') : (mIsLeft ? 'bottom left' : 'bottom right') }}>
                <svg className="ask-ring" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="previewAskGradM" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                      <stop offset="0%"   stopColor="#C87F85" />
                      <stop offset="50%"  stopColor="#68D4FD" />
                      <stop offset="100%" stopColor="#566ABD" />
                    </linearGradient>
                  </defs>
                  <circle cx="36" cy="36" r="33" stroke="url(#previewAskGradM)" strokeWidth="3" />
                </svg>
                <div className="ask-inner">
                  {iconType === 'mascot' && <img src={mascotImgSrc} alt="mascot" style={{ width: 42, height: 42, objectFit: 'contain' }} />}
                  {iconType === 'custom' && appearance.customIconUrl && <img src={appearance.customIconUrl} alt="icon" style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 4 }} />}
                  {iconType !== 'ask' && iconType !== 'mascot' && iconType !== 'custom' && <svg width="30" height="30" viewBox="0 0 24 24" fill={appearance.primaryColor || '#667eea'}><path d={getIconPath(iconType)} /></svg>}
                  {(iconType === 'ask' || !iconType) && <span className="ask-text" style={{ color: '#1a237e' }}>Ask</span>}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="ap-phone-home" />
      </div>
    );
  }

  // ── DESKTOP PREVIEW ─────────────────────────────────────────────
  return (
    <div className="ap-preview-root" style={posStyle}>

      {/* -- Chat Window -- */}
      {isOpen && (
        <div className="ss-window" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: 12, '--chat-bg': chatBg, '--header-name-color': headerNameColor, '--typing-dot-color': typingDotsColor }}>

          {/* Header */}
          <div className="ss-header">
            <div className="ss-hdr-row">
              <div className="ss-hdr-avatar">
                {appearance.avatarCustomIconUrl
                  ? <img src={appearance.avatarCustomIconUrl} alt="avatar" className="ss-hdr-avatar-img" />
                  : (appearance.avatarIconType && appearance.avatarIconType !== 'default')
                    ? (
                      <div className="ss-hdr-avatar-initials" style={{ background: gradient }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                          <path d={getIconPath(appearance.avatarIconType)} />
                        </svg>
                      </div>
                    )
                    : <img src={headerAvatar} alt="avatar" className="ss-hdr-avatar-img" />
                }
              </div>
              <div className="ss-hello" style={{ backgroundImage: helloGradient, fontWeight: 800 }}>Hello!!</div>
              <button className="ss-close" style={{ background: accentGradient }} onClick={() => setIsOpen(false)}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="ss-hdr-name">I'm <strong>{content.assistantName || 'Chat Assistant'}</strong></div>
            <div className="ss-hdr-tagline">{content.tagline || 'Your go-to help for all queries.'}</div>
          </div>

          {/* Messages */}
          <div className="ss-messages">
            {sampleMessages.map((msg, i) => (
              <div key={i} className={`ss-msg ${msg.type === 'user' ? 'ss-msg-user' : 'ss-msg-bot'}`}>
                {msg.type === 'bot' && (
                  <div className="ss-msg-avatar" style={{ background: botAvatarColor }}>{initials}</div>
                )}
                <div
                  className={`ss-bubble ${msg.type === 'user' ? 'ss-bubble-user' : 'ss-bubble-bot'}`}
                  style={msg.type === 'user'
                    ? { background: userBubbleColor, color: appearance.userTextColor || '#fff' }
                    : { '--bot-bubble-bg': appearance.botBubbleColor || '#EFEFEF', '--bot-bubble-color': appearance.botTextColor || '#1a1a2e' }
                  }
                >
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                  <div className="ss-msg-user-avatar" style={{ background: accentGradient }}>{userInitial}</div>
                )}
              </div>
            ))}

            {/* Choice buttons */}
            <div className="ss-msg ss-msg-user" style={{ alignItems: 'flex-start' }}>
              <div className={`ss-choices${dynamicChoices ? ' ss-choices-dynamic' : ''}`}>
                {choices.map((c, i) => {
                  const isSel  = selectedChoice === c;
                  const hasSel = selectedChoice !== null;
                  let s;
                  if (isSel)       s = { '--btn-bg': choiceActiveColor, '--btn-color': '#fff',      '--btn-border': choiceActiveColor };
                  else if (hasSel) s = { '--btn-bg': '#fff',            '--btn-color': choiceDimColor,   '--btn-border': choiceDimColor };
                  else             s = { '--btn-bg': '#fff',            '--btn-color': choiceActiveColor, '--btn-border': choiceActiveColor };
                  return (
                    <button
                      key={i}
                      className="ss-choice-btn"
                      onClick={() => setSelectedChoice(isSel ? null : c)}
                      style={s}
                    >{c}</button>
                  );
                })}
              </div>
              <div className="ss-msg-user-avatar" style={{ background: accentGradient, flexShrink: 0, alignSelf: 'flex-start' }}>{userInitial}</div>
            </div>
          </div>

          {/* Input */}
          <form className="ss-form" onSubmit={e => e.preventDefault()}>
            <input
              className="ss-input"
              placeholder={content.inputPlaceholder || 'Type your message...'}
              readOnly
            />
            <button type="submit" className="ss-send" style={{ background: accentGradient }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* -- Ask / Close trigger -- */}
      {isOpen ? (
        <div className="ask-icon-close" onClick={() => setIsOpen(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
      ) : (
        <div className={`ask-icon-wrap${breathe ? ' ask-breathing' : ''}`} onClick={() => setIsOpen(true)}>
          <svg className="ask-ring" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="previewAskGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#C87F85" />
                <stop offset="50%"  stopColor="#68D4FD" />
                <stop offset="100%" stopColor="#566ABD" />
              </linearGradient>
            </defs>
            <circle cx="36" cy="36" r="33" stroke="url(#previewAskGrad)" strokeWidth="3" />
          </svg>
          <div className="ask-inner">
            {iconType === 'mascot' && (
              <img src={mascotImgSrc} alt="mascot" style={{ width: 42, height: 42, objectFit: 'contain' }} />
            )}
            {iconType === 'custom' && appearance.customIconUrl && (
              <img src={appearance.customIconUrl} alt="icon" style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 4 }} />
            )}
            {iconType !== 'ask' && iconType !== 'mascot' && iconType !== 'custom' && (
              <svg width="30" height="30" viewBox="0 0 24 24" fill={appearance.primaryColor || '#667eea'}>
                <path d={getIconPath(iconType)} />
              </svg>
            )}
            {(iconType === 'ask' || !iconType) && (
              <span className="ask-text" style={{ color: '#1a237e' }}>Ask</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetPreview;
