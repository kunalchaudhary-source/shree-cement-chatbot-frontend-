import defaultSettings from '../config/defaultSettings';

const STORAGE_KEY = 'chatbot_widget_settings';

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(defaultSettings);
    const saved = JSON.parse(raw);
    // Deep merge saved over defaults so new keys are always present
    return deepMerge(deepClone(defaultSettings), saved);
  } catch {
    return deepClone(defaultSettings);
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings, null, 2));
}

export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  return deepClone(defaultSettings);
}

export function exportJSON(settings) {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chatbot-settings.json';
  a.click();
  URL.revokeObjectURL(url);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(target, source) {
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
  return target;
}
