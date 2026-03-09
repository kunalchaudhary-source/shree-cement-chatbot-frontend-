import React from 'react';
import mascotImg from '../../resources/Group 123266.png';
import { getIconPath } from '../utils/icons';

const RING_SVG = (id) => (
  <svg className="ask-ring" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#C87F85" />
        <stop offset="50%"  stopColor="#68D4FD" />
        <stop offset="100%" stopColor="#566ABD" />
      </linearGradient>
    </defs>
    <circle cx="36" cy="36" r="33" stroke={`url(#${id})`} strokeWidth="3" />
  </svg>
);

const ChatIcon = ({ onClick, isOpen, unreadCount = 0, appearance = {}, showCloseButton = true, isMobile = false }) => {
  if (isOpen) {
    // On mobile the chat header owns the close button — no floating trigger needed
    if (isMobile) return null;
    if (!showCloseButton) return null;
    return (
      <div className="ask-icon ask-icon-close" onClick={onClick}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        {unreadCount > 0 && <div className="ask-badge">{unreadCount}</div>}
      </div>
    );
  }

  const breathe  = appearance.askButtonBreathing !== false;
  const iconType = appearance.iconType || 'ask';
  const primary  = appearance.primaryColor || '#667eea';
  const wrapClass = `ask-icon-wrap${breathe ? ' ask-breathing' : ''}${isMobile ? ' ask-icon-mobile' : ''}`;

  let innerContent;
  if (iconType === 'mascot') {
    innerContent = <img src={mascotImg} alt="mascot" style={{ width: 42, height: 42, objectFit: 'contain' }} />;
  } else if (iconType === 'custom' && appearance.customIconUrl) {
    innerContent = <img src={appearance.customIconUrl} alt="icon" style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 4 }} />;
  } else if (iconType !== 'ask') {
    // legacy SVG icon (chat, robot, message, support, help, heart, lightning, star)
    const iconPath = getIconPath(iconType);
    innerContent = (
      <svg width="30" height="30" viewBox="0 0 24 24" fill={primary}>
        <path d={iconPath} />
      </svg>
    );
  } else {
    innerContent = <span className="ask-text" style={{ color: '#1a237e' }}>Ask</span>;
  }

  return (
    <div className={wrapClass} onClick={onClick}>
      {RING_SVG('askGrad')}
      <div className="ask-inner">
        {innerContent}
        {unreadCount > 0 && <div className="ask-badge">{unreadCount}</div>}
      </div>
    </div>
  );
};

export default ChatIcon;
