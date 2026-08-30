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
 * Utility to load and decode data from localStorage.
 */
export const loadEncoded = <T = any>(key: string): T | null => {
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    const decoded = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(decoded);

    // If the data doesn't have our version wrapper, or the version doesn't match, clear it
    if (!parsed || parsed.v !== __APP_VERSION__ || parsed.d === undefined) {
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
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith('mpga_')) {
      localStorage.removeItem(key);
    }
  });
};
