import React, { useState, useEffect } from 'react';
import ChatIcon from './ChatIcon';
import ChatWindow from './ChatWindow';
import { CHAT_STATES } from '../utils/constants';
import ChatService from '../services/ChatService';
import '../styles/chatbot.css';

const DEFAULT_WORKFLOW = {
  apiBaseUrl:  process.env.REACT_APP_API_BASE_URL  || 'http://localhost:3001/api/v1',
  typebotId:   process.env.REACT_APP_TYPEBOT_ID    || 'n7r13wu6szxrc82w46klq78e',
  bearerToken: process.env.REACT_APP_BEARER_TOKEN  || '6YvtqmdZZR8BflsEaHSmRZcB',
};

// Returns true when running on a mobile/touch device or narrow viewport
function detectMobile() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouchDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return isTouchDevice || window.innerWidth <= 480;
}

const DEFAULT_APPEARANCE = {
  primaryColor:         '#667eea',
  secondaryColor:       '#764ba2',
  headerTextColor:      '#ffffff',
  botBubbleColor:       '#EFEFEF',
  botTextColor:         '#333333',
  botAvatarColor:       '#012A89',
  userBubbleColor:      '#0032A1',
  userTextColor:        '#ffffff',
  statusText:           'Online',
  position:             'bottom-right',
  iconType:             'ask',
  customIconUrl:        '',
  avatarIconType:       'default',
  avatarCustomIconUrl:  '',
  askButtonBreathing:   true,
  dynamicChoiceSize:    true,
  choiceActiveColor:    '#0032A1',
  choiceDimColor:       '#B6B6B6',
  chatBgAccentColor:    '#ACC5FF',
  helloGradientStart:   '#8724FF',
  helloGradientEnd:     '#155CFF',
  accentGradientStart:  '#012C8F',
  accentGradientEnd:    '#001F63',
  splashGradientStart:  '#BD67FF',
  splashGradientEnd:    '#2E4FDF',
  splashMascotUrl:      '',
};

const DEFAULT_CONTENT = {
  assistantName:    'Chat Assistant',
  tagline:          'Your go-to help for all queries.',
  inputPlaceholder: 'Type your message...',
};

const DEFAULT_BEHAVIOR = {
  widgetVisible:  true,
  autoOpen:       false,
  splashEnabled:  true,
};

const ChatWidget = ({ widgetSettings = {}, userId = null, userName = null }) => {
  const appearance = { ...DEFAULT_APPEARANCE, ...(widgetSettings.appearance || {}) };
  const content    = { ...DEFAULT_CONTENT,    ...(widgetSettings.content    || {}) };
  const behavior   = { ...DEFAULT_BEHAVIOR,   ...(widgetSettings.behavior   || {}) };
  const workflow   = { ...DEFAULT_WORKFLOW,   ...(widgetSettings.workflow   || {}) };

  // Apply workflow config to ChatService whenever settings change
  useEffect(() => { ChatService.configure(workflow); }, [workflow.apiBaseUrl, workflow.typebotId, workflow.bearerToken]);

  const [chatState, setChatState]   = useState(
    behavior.autoOpen ? CHAT_STATES.OPEN : CHAT_STATES.CLOSED
  );
  const [showSplash, setShowSplash] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile]     = useState(() => detectMobile());

  useEffect(() => {
    const onResize = () => setIsMobile(detectMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (behavior.autoOpen && chatState === CHAT_STATES.CLOSED) {
      setChatState(CHAT_STATES.OPEN);
    }
  }, [behavior.autoOpen]);

  if (!behavior.widgetVisible) return null;

  const handleIconClick = () => {
    if (chatState === CHAT_STATES.CLOSED) {
      if (behavior.splashEnabled !== false) {
        // Show splash for 1.6 s then open chat
        setShowSplash(true);
        setTimeout(() => setShowSplash(false), 1600);
      }
      setChatState(CHAT_STATES.OPEN);
      setUnreadCount(0);
    } else {
      setChatState(CHAT_STATES.CLOSED);
      setShowSplash(false);
    }
  };

  const handleCloseChat = () => {
    setChatState(CHAT_STATES.CLOSED);
    setShowSplash(false);
  };

  // Helper: resolve position style for any of the 4 corners
  function cornerStyle(pos, isMob) {
    const gap = isMob ? 5 : 20;
    const edge = isMob ? 8 : 20;
    const isTop    = pos.startsWith('top');
    const isLeft   = pos.endsWith('left');
    return {
      ...(isTop  ? { top: gap,    bottom: 'auto' } : { bottom: gap,   top:   'auto' }),
      ...(isLeft ? { left: edge,  right:  'auto' } : { right: edge,   left:  'auto' }),
    };
  }

  const desktopPos = appearance.position       || 'bottom-right';
  const mobilePos  = appearance.mobilePosition  || 'top-right';
  const activePos  = isMobile ? mobilePos : desktopPos;
  const positionStyle = cornerStyle(activePos, isMobile);
  const isTop  = activePos.startsWith('top');
  const isLeft = activePos.endsWith('left');
  const widgetClass = [
    'chatbot-widget',
    isMobile ? 'is-mobile' : '',
    isTop    ? 'is-top'    : '',
    isLeft   ? 'is-left'   : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={widgetClass} style={positionStyle}>
      <ChatWindow
        isVisible={chatState === CHAT_STATES.OPEN}
        showSplash={showSplash}
        onClose={handleCloseChat}
        appearance={appearance}
        content={content}
        behavior={behavior}
        userId={userId}
        userName={userName}
        isMobile={isMobile}
      />
      <ChatIcon
        onClick={handleIconClick}
        isOpen={chatState === CHAT_STATES.OPEN}
        unreadCount={unreadCount}
        appearance={appearance}
        showCloseButton={behavior.closeButtonVisible !== false}
        isMobile={isMobile}
      />
    </div>
  );
};

export default ChatWidget;
