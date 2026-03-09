import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget';

const ADMIN_API = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:5001';

// ── IMPORTANT: capture script attributes SYNCHRONOUSLY before any async code ──
// document.currentScript is only valid during synchronous script execution.
// webpack bundles run synchronously, so this works at module top-level.
const _selfScript =
  document.currentScript ||
  document.querySelector('script[data-user-id]') ||
  document.querySelector('script[src*="chatbot-widget"]');
const _scriptUserId   = _selfScript?.getAttribute('data-user-id')   || null;
 const _scriptUserName = _selfScript?.getAttribute('data-user-name') || null;
const _scriptAutoInit = _selfScript?.getAttribute('data-auto-init') || null;

async function fetchWidgetSettings(userId) {
  try {
    const res = await fetch(`${ADMIN_API}/api/settings/${userId}`);
    if (!res.ok) return {};
    const { settings } = await res.json();
    return settings || {};
  } catch {
    return {};
  }
}

// Global function to initialize the chatbot
window.initChatbot = async function(config = {}) {
  const defaultConfig = {
    containerId: 'chatbot-root',
    apiUrl:      process.env.REACT_APP_API_BASE_URL  || 'http://localhost:3001/api/v1',
    typebotId:   process.env.REACT_APP_TYPEBOT_ID    || 'n7r13wu6szxrc82w46klq78e',
    bearerToken: process.env.REACT_APP_BEARER_TOKEN  || '6YvtqmdZZR8BflsEaHSmRZcB',
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Read userId: JS config > data-user-id attribute (captured synchronously above)
  const userId   = finalConfig.userId   || _scriptUserId   || null;
  const userName = finalConfig.userName || _scriptUserName || null;

  let widgetSettings = {};
  if (userId) {
    widgetSettings = await fetchWidgetSettings(userId);
  }

  // Create container if it doesn't exist
  let container = document.getElementById(finalConfig.containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = finalConfig.containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<ChatWidget widgetSettings={widgetSettings} userId={userId} userName={userName} />);

  // ── Cross-tab live refresh via BroadcastChannel ──────────────────────────
  // When admin panel saves settings it broadcasts on 'chatbot-settings'.
  // Any widget tab with a matching userId will instantly re-render.
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('chatbot-settings');
    channel.onmessage = async (e) => {
      if (!userId || e.data.userId === userId) {
        // Fetch fresh settings from DB (guarantees we have the latest)
        const fresh = await fetchWidgetSettings(userId || e.data.userId);
        root.render(<ChatWidget widgetSettings={fresh} userId={userId || e.data.userId} userName={userName} />);
      }
    };
  }

  // ── Same-page fallback (admin panel embedded on same page) ───────────────
  window.addEventListener('chatbot-settings-updated', (e) => {
    root.render(<ChatWidget widgetSettings={e.detail} userId={userId} userName={userName} />);
  });

  return {
    destroy: () => {
      root.unmount();
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },
    show:    () => { container.style.display = 'block'; },
    hide:    () => { container.style.display = 'none';  },
  };
};

// Auto-initialize when data-auto-init attribute is present
if (_scriptAutoInit === 'true') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.initChatbot());
  } else {
    window.initChatbot();
  }
} else {
  // Legacy fallback: still auto-init so the demo page at localhost:4000 works
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => window.initChatbot(), 100));
  } else {
    setTimeout(() => window.initChatbot(), 100);
  }
}

export { ChatWidget };
export default window.initChatbot;