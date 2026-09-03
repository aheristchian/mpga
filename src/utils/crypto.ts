/**
 * Web Crypto AES-GCM Encryption / Decryption Utilities for MPGA Multiplayer.
 * Encrypts private role cards and confidential night actions transmitted across public MQTT brokers.
 */

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const keyCache = new Map<string, CryptoKey>();

async function getDerivedKey(secret: string): Promise<CryptoKey> {
  const cached = keyCache.get(secret);
  if (cached) return cached;

  const enc = new TextEncoder();
  const keyHash = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  const key = await crypto.subtle.importKey('raw', keyHash, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
  keyCache.set(secret, key);
  return key;
}

export interface EncryptedMessage {
  __encrypted: true;
  iv: string;
  ciphertext: string;
}

export function isEncryptedMessage(obj: any): obj is EncryptedMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.__encrypted === true &&
    typeof obj.iv === 'string' &&
    typeof obj.ciphertext === 'string'
  );
}

/**
 * Encrypts an object using AES-GCM with a secret derived from roomCode + passcode.
 */
export async function encryptPayload(payload: any, secret: string): Promise<EncryptedMessage> {
  const key = await getDerivedKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const rawBytes = enc.encode(JSON.stringify(payload));

  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, rawBytes);

  return {
    __encrypted: true,
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(cipherBuffer),
  };
}

/**
 * Decrypts an AES-GCM encrypted message.
 */
export async function decryptPayload<T = any>(
  encrypted: EncryptedMessage,
  secret: string
): Promise<T> {
  const key = await getDerivedKey(secret);
  const iv = base64ToBuffer(encrypted.iv);
  const cipherBytes = base64ToBuffer(encrypted.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    cipherBytes as any
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
}
