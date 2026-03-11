// Environment variables with fallbacks
export const API_BASE_URL    = process.env.REACT_APP_API_BASE_URL    || '';
export const TYPEBOT_ID      = process.env.REACT_APP_TYPEBOT_ID      || '';
export const BEARER_TOKEN    = process.env.REACT_APP_BEARER_TOKEN    || '';

export const CHAT_STATES = {
  CLOSED: 'closed',
  MINIMIZED: 'minimized',
  OPEN: 'open',
  LOADING: 'loading'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system'
};