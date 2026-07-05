const PREFIX = 'digital_signage_mvp';

export const STORAGE_PREFIX = PREFIX;

export function readJson(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(`${PREFIX}:${key}`);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
}

export function removeJson(key) {
  window.localStorage.removeItem(`${PREFIX}:${key}`);
}
