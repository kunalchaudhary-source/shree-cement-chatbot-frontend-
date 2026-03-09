import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import { MESSAGE_TYPES } from '../utils/constants';
import ChatService from '../services/ChatService';
import mascotImg    from '../../resources/Group 123266.png';
import headerAvatar from '../../resources/Group 123266 (1).png';
import { getIconPath } from '../utils/icons';

const ADMIN_API = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:5001';

// Fire-and-forget log helper — never throws so it cannot break the chat UI
async function logMessage(userId, sessionId, sender, message) {
  if (!userId) return;
  try {
    await fetch(`${ADMIN_API}/api/logs/${userId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ session_id: sessionId, sender, message }),
    });
  } catch {
    // Silently swallow network errors
  }
}

const ChatWindow = ({ isVisible, showSplash = false, onClose, appearance = {}, content = {}, behavior = {}, userId = null, userName = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [choiceOptions, setChoiceOptions] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [hoveredChoice, setHoveredChoice] = useState(null);
  const messagesEndRef = useRef(null);
  // Stable session ID created once per widget mount
  const sessionIdRef = useRef(Date.now().toString(36) + Math.random().toString(36).slice(2, 7));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isVisible && !isChatStarted) {
      initializeChat();
    }
  }, [isVisible, isChatStarted]);

  const initializeChat = async () => {
    setIsLoading(true);
    const minDelay = behavior.typingDuration ?? 1500;
    const t0 = Date.now();
    try {
      const result = await ChatService.startChat();
      const elapsed = Date.now() - t0;
      if (elapsed < minDelay) await new Promise(r => setTimeout(r, minDelay - elapsed));
      if (result.success) {
        setIsChatStarted(true);
        
        // Add processed messages from the API response
        if (result.data.processedMessages && result.data.processedMessages.length > 0) {
          setMessages(result.data.processedMessages);
          // Log initial bot messages
          result.data.processedMessages.forEach(m =>
            logMessage(userId, sessionIdRef.current, 'bot', m.message)
          );
        } else {
          // Default welcome message
          const welcome = {
            id: 'welcome',
            message: 'Hello! How can I help you today?',
            type: MESSAGE_TYPES.BOT,
            timestamp: Date.now()
          };
          setMessages([welcome]);
          logMessage(userId, sessionIdRef.current, 'bot', welcome.message);
        }
        
        // Set choice options if available
        setChoiceOptions(result.data.choiceOptions);
        
      } else {
        setMessages([{
          id: 'error',
          message: 'Sorry, I\'m having trouble connecting. Please try again later.',
          type: MESSAGE_TYPES.BOT,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([{
        id: 'error',
        message: 'Sorry, I\'m having trouble connecting. Please try again later.',
        type: MESSAGE_TYPES.BOT,
        timestamp: Date.now()
      }]);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (messageText, keepChoices = false) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      message: messageText,
      type: MESSAGE_TYPES.USER,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    logMessage(userId, sessionIdRef.current, 'user', messageText);
    setInputValue('');
    if (!keepChoices) setChoiceOptions(null);
    setIsLoading(true);
    const _minDelay = behavior.typingDuration ?? 1500;
    const _t0 = Date.now();

    try {
      const result = await ChatService.sendMessage(messageText);
      const _elapsed = Date.now() - _t0;
      if (_elapsed < _minDelay) await new Promise(r => setTimeout(r, _minDelay - _elapsed));
      if (result.success) {
        // Add processed messages from the API response
        if (result.data.processedMessages && result.data.processedMessages.length > 0) {
          setMessages(prev => [...prev, ...result.data.processedMessages]);
          // Log each bot response
          result.data.processedMessages.forEach(m =>
            logMessage(userId, sessionIdRef.current, 'bot', m.message)
          );
        }
        
        // Set new choice options if available — reset both selectedChoice and
        // hoveredChoice in the same batch so fresh buttons render blue immediately
        setChoiceOptions(result.data.choiceOptions);
        setSelectedChoice(null);
        setHoveredChoice(null);
        
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          message: 'Sorry, I couldn\'t process your message. Please try again.',
          type: MESSAGE_TYPES.BOT,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        message: 'Sorry, something went wrong. Please try again.',
        type: MESSAGE_TYPES.BOT,
        timestamp: Date.now()
      }]);
    }
    setIsLoading(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
    }
  };

  const handleChoiceClick = (choiceText) => {
    setSelectedChoice(choiceText);
    handleSendMessage(choiceText, true); // keep choices visible with selected/dim state while awaiting bot response
  };

  // Reset selected choice whenever fresh options arrive
  useEffect(() => { setSelectedChoice(null); }, [choiceOptions]);

  if (!isVisible) return null;

  const primaryColor   = appearance.primaryColor   || '#667eea';
  const secondaryColor = appearance.secondaryColor || '#764ba2';
  const gradient       = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;

  // Hello!! text gradient (configurable separately)
  const helloGradient  = `linear-gradient(91.72deg, ${appearance.helloGradientStart  || '#8724FF'} 1.46%, ${appearance.helloGradientEnd  || '#155CFF'} 32.31%)`;
  // SS bubble + close button gradient (configurable separately)
  const accentGradient = `linear-gradient(135deg, ${appearance.accentGradientStart || '#012C8F'} 0%, ${appearance.accentGradientEnd || '#001F63'} 100%)`;
  // Splash screen background gradient
  const splashGradient = `linear-gradient(160deg, ${appearance.splashGradientStart || '#BD67FF'} 0%, ${appearance.splashGradientEnd || '#2E4FDF'} 100%)`;

  // Derive initials from assistant name
  const nameWords = (content.assistantName || 'Chat Assistant').split(' ');
  const initials  = nameWords.length >= 2
    ? (nameWords[0][0] + nameWords[1][0]).toUpperCase()
    : (content.assistantName || 'CA').slice(0, 2).toUpperCase();

  // Derive user initial from userName prop (passed from data-user-name attribute)
  const userInitial = userName
    ? (() => {
        const parts = userName.trim().split(/\s+/);
        return parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : userName.slice(0, 2).toUpperCase();
      })()
    : 'U';

  const userBubbleColor   = appearance.userBubbleColor   || '#0032A1';
  const botBubbleColor     = appearance.botBubbleColor     || '#EFEFEF';
  const botTextColor       = appearance.botTextColor       || '#1a1a2e';
  const botAvatarColor     = appearance.botAvatarColor     || '#012A89';
  const choiceActiveColor  = appearance.choiceActiveColor  || '#0032A1';
  const choiceDimColor     = appearance.choiceDimColor     || '#B6B6B6';
  const dynamicChoices     = appearance.dynamicChoiceSize  !== false;
  const chatBgAccentColor  = appearance.chatBgAccentColor  || '#ACC5FF';
  const headerNameColor    = appearance.headerNameColor    || '#000000';
  const typingDotsColor    = appearance.typingDotsColor    || '#012A89';
  const chatBg = `linear-gradient(175.38deg, ${chatBgAccentColor} -6.21%, #FFFFFF 21.5%, #FFFFFF 74.69%, ${chatBgAccentColor} 105.39%)`;

  // ── Splash / loading screen ──
  if (showSplash) {
    const splashMascot = appearance.splashMascotUrl || mascotImg;
    return (
      <div className="ss-window ss-splash" style={{ background: splashGradient }}>
        <div className="ss-splash-body">
          <div className="ss-splash-oval-wrap">
            <div className="ss-splash-oval" />
            <img src={splashMascot} alt="mascot" className="ss-splash-mascot" />
          </div>
          <div className="ss-splash-name">{content.assistantName || 'Chat Assistant'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-window" style={{ '--chat-bg': chatBg, '--header-name-color': headerNameColor, '--typing-dot-color': typingDotsColor }}>

      {/* ── Header ── */}
      <div className="ss-header">

        {/* Row 1: avatar + Hello!! + close */}
        <div className="ss-hdr-row">
          <div className="ss-hdr-avatar">
            {appearance.avatarCustomIconUrl
              ? <img src={appearance.avatarCustomIconUrl} alt="avatar" className="ss-hdr-avatar-img" />
              : (appearance.avatarIconType && appearance.avatarIconType !== 'default')
                ? (
                  <div className="ss-hdr-avatar-initials" style={{ background: gradient }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                      <path d={getIconPath(appearance.avatarIconType)} />
                    </svg>
                  </div>
                )
                : <img src={headerAvatar} alt="avatar" className="ss-hdr-avatar-img" />
            }
          </div>
          <div className="ss-hello" style={{ backgroundImage: helloGradient, fontWeight: 800, fontStyle: 'normal' }}>Hello!!</div>
          <button className="ss-close" style={{ background: accentGradient }} onClick={onClose}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Row 2: name + tagline */}
        <div className="ss-hdr-name">
          I'm <strong>{content.assistantName || 'Chat Assistant'}</strong>
        </div>
        <div className="ss-hdr-tagline">
          {content.tagline || 'Your go-to help for all queries.'}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="ss-messages">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg.message}
            type={msg.type}
            timestamp={msg.timestamp}
            showTimestamp={behavior.showTimestamps !== false}
            appearance={appearance}
            initials={initials}
            userInitial={userInitial}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentGradient={accentGradient}
            userBubbleColor={userBubbleColor}
          />
        ))}

        {choiceOptions && choiceOptions.length > 0 && !(isLoading && selectedChoice !== null) && (
          <div className="ss-msg ss-msg-user" style={{ alignItems: 'flex-start' }}>
            <div className={`ss-choices${dynamicChoices ? ' ss-choices-dynamic' : ''}`}>
              {choiceOptions.map((choice) => {
                const isSelected  = selectedChoice === choice.content;
                const hasSelected = selectedChoice !== null;
                const isHovered   = hoveredChoice  === choice.content;
                const hasHovered  = hoveredChoice  !== null;

                // While loading after a selection, hide ALL buttons —
                // the chosen text is already shown as a user message bubble above
                if (isLoading && hasSelected) return null;

                let btnStyle;
                if (isSelected) {
                  btnStyle = { '--btn-bg': choiceActiveColor, '--btn-color': '#fff', '--btn-border': choiceActiveColor };
                } else if (hasSelected) {
                  btnStyle = { '--btn-bg': '#fff', '--btn-color': choiceDimColor, '--btn-border': choiceDimColor };
                } else if (hasHovered && !isHovered) {
                  btnStyle = { '--btn-bg': '#fff', '--btn-color': choiceDimColor, '--btn-border': choiceDimColor };
                } else {
                  btnStyle = { '--btn-bg': '#fff', '--btn-color': choiceActiveColor, '--btn-border': choiceActiveColor };
                }
                return (
                  <button
                    key={choice.id}
                    className="ss-choice-btn"
                    onClick={() => handleChoiceClick(choice.content)}
                    onMouseEnter={() => !hasSelected && setHoveredChoice(choice.content)}
                    onMouseLeave={() => setHoveredChoice(null)}
                    onTouchStart={() => !hasSelected && setHoveredChoice(choice.content)}
                    onTouchEnd={() => setHoveredChoice(null)}
                    onTouchCancel={() => setHoveredChoice(null)}
                    disabled={isLoading || (selectedChoice !== null && !isSelected)}
                    style={btnStyle}
                  >
                    {choice.content}
                  </button>
                );
              })}
            </div>
            <div className="ss-msg-user-avatar" style={{ background: accentGradient, flexShrink: 0, alignSelf: 'flex-start' }}>
              {userInitial}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="ss-msg ss-msg-bot">
            <div className="ss-msg-avatar" style={{ background: botAvatarColor }}>{initials}</div>
            <div className="ss-bubble ss-bubble-bot" style={{ '--bot-bubble-bg': botBubbleColor, '--bot-bubble-color': botTextColor }}>
              <div className="ss-typing">
                <span/><span/><span/>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      {behavior.inputEnabled !== false && (
      <form className="ss-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={content.inputPlaceholder || 'Type your message...'}
          className="ss-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="ss-send"
          style={inputValue.trim() ? { background: accentGradient } : {}}
          disabled={!inputValue.trim() || isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
          </svg>
        </button>
      </form>
      )}
    </div>
  );
};

export default ChatWindow;