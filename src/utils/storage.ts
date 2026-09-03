/**
 * Utility to encode and save data to localStorage.
 * Uses Base64 encoding to obfuscate the data so it isn't easily readable by users.
 * Embeds __APP_VERSION__ to automatically invalidate stale cache when the app updates.
 */
export const saveEncoded = <T>(key: string, data: T): void => {
  try {
    const payload = { v: __APP_VERSION__, d: data };
    const stringified = JSON.stringify(payload);
    // encodeURIComponent ensures UTF-8 characters are safely converted to Base64
    const encoded = btoa(encodeURIComponent(stringified));
    localStorage.setItem(key, encoded);
  } catch (e) {
    console.error(`Failed to encode and save data for key: ${key}`, e);
  }
};

/**
 * Checks if a saved cache version is compatible with the running app version.
 * Compatible as long as the major version matches (e.g. 2.0.0 is compatible with 2.0.1 or 2.1.0).
 */
export const isVersionCompatible = (
  savedVersion?: string,
  currentVersion: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.0'
): boolean => {
  if (!savedVersion || typeof savedVersion !== 'string') return false;
  const savedMajor = savedVersion.split('.')[0];
  const currentMajor = currentVersion.split('.')[0];
  return Boolean(savedMajor && currentMajor && savedMajor === currentMajor);
};

/**
 * Utility to load and decode data from localStorage.
 */
export const loadEncoded = <T = any>(key: string): T | null => {
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    const decoded = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(decoded);

    // If the data doesn't have our version wrapper, or major version doesn't match, clear it
    if (!parsed || !isVersionCompatible(parsed.v) || parsed.d === undefined) {
      console.warn(`Version mismatch or invalid data for key: ${key}. Clearing cache.`);
      localStorage.removeItem(key);
      return null;
    }

    return parsed.d as T;
  } catch {
    // If decoding fails (e.g. old unencoded data), clear the invalid data and return null
    console.warn(`Failed to decode data for key: ${key}. Clearing invalid data.`);
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Utility to clear all game-related storage keys.
 */
export const clearGameStorage = (): void => {
  if (typeof localStorage === 'undefined') return;
  const keysToRemove: string[] = [];
  const len = localStorage.length || 0;
  for (let i = 0; i < len; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('mpga_')) {
      keysToRemove.push(key);
    }
  }
  // Check Object.keys as fallback
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('mpga_') && !keysToRemove.includes(key)) {
        keysToRemove.push(key);
      }
    });
  } catch {
    // ignore
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};
