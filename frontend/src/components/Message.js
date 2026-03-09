import React from 'react';
import { MESSAGE_TYPES } from '../utils/constants';

const Message = ({ message, type, timestamp, showTimestamp = true, appearance = {}, initials = 'SS', userInitial = 'U', primaryColor, secondaryColor, accentGradient, userBubbleColor }) => {
  const isUser = type === MESSAGE_TYPES.USER;

  const pColor = primaryColor   || appearance.primaryColor   || '#667eea';
  const sColor = secondaryColor || appearance.secondaryColor || '#764ba2';
  const gradient = `linear-gradient(135deg, ${pColor} 0%, ${sColor} 100%)`;
  const bubbleGradient = accentGradient || `linear-gradient(135deg, ${appearance.accentGradientStart || '#012C8F'} 0%, ${appearance.accentGradientEnd || '#001F63'} 100%)`;
  const botAvatarBg = appearance.botAvatarColor || '#012A89';
  const userBg = userBubbleColor || appearance.userBubbleColor || '#0032A1';

  return (
    <div className={`ss-msg ${isUser ? 'ss-msg-user' : 'ss-msg-bot'}`}>
      {!isUser && (
        <div className="ss-msg-avatar" style={{ background: botAvatarBg }}>
          {initials}
        </div>
      )}
      <div className="ss-msg-body">
        <div
          className={`ss-bubble ${isUser ? 'ss-bubble-user' : 'ss-bubble-bot'}`}
          style={isUser
            ? { background: userBg, color: appearance.userTextColor || '#fff' }
            : {
                '--bot-bubble-bg':    appearance.botBubbleColor || '#EFEFEF',
                '--bot-bubble-color': appearance.botTextColor    || '#1a1a2e',
              }
          }
        >
          {message}
        </div>
        {timestamp && showTimestamp && (
          <div className={`ss-time ${isUser ? 'ss-time-user' : 'ss-time-bot'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      {isUser && (
        <div className="ss-msg-user-avatar" style={{ background: bubbleGradient }}>
          {userInitial}
        </div>
      )}
    </div>
  );
};

export default Message;