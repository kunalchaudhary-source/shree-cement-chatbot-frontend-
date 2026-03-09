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

/**
 * Opens a file picker, reads a JSON settings file, and returns
 * the parsed settings object. Rejects if the file is not valid JSON.
 */
export function importJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          resolve(parsed);
        } catch {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
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
