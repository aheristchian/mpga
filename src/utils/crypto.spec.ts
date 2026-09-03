import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload, isEncryptedMessage } from './crypto';

describe('Web Crypto AES-GCM multiplayer encryption', () => {
  it('encrypts and decrypts private role payload accurately', async () => {
    const secret = 'ROOM42:mysecretpasscode';
    const payload = {
      name: 'Alice',
      role: { id: 'godfather', name: 'Godfather', sideId: 'mafia' },
      isDead: false,
    };

    const encrypted = await encryptPayload(payload, secret);
    expect(isEncryptedMessage(encrypted)).toBe(true);
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();

    const decrypted = await decryptPayload(encrypted, secret);
    expect(decrypted).toEqual(payload);
  });

  it('fails decryption if secret does not match', async () => {
    const secret = 'ROOM42:passcode1';
    const wrongSecret = 'ROOM42:passcode2';
    const payload = { secretInfo: 'confidential' };

    const encrypted = await encryptPayload(payload, secret);

    await expect(decryptPayload(encrypted, wrongSecret)).rejects.toThrow();
  });
});
