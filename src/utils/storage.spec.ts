import { describe, it, expect, beforeEach } from 'vitest';
import { saveEncoded, loadEncoded, clearGameStorage, isVersionCompatible } from './storage';

// Mock localStorage for node test runner
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: any) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] || null,
    get [Symbol.toStringTag]() {
      return 'Storage';
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: new Proxy(storageMock, {
    get(target, prop: string) {
      if (prop in target) {
        return (target as any)[prop];
      }
      return (target as any).getItem(prop);
    },
    set(target, prop: string, value: any) {
      (target as any).setItem(prop, value);
      return true;
    },
    deleteProperty(target, prop: string) {
      (target as any).removeItem(prop);
      return true;
    },
    ownKeys() {
      return Object.keys(storageMock as any);
    },
  }),
  writable: true,
});

(globalThis as any).__APP_VERSION__ = '2.0.0';

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates version compatibility correctly based on major version', () => {
    expect(isVersionCompatible('2.0.0', '2.0.1')).toBe(true);
    expect(isVersionCompatible('2.1.5', '2.0.0')).toBe(true);
    expect(isVersionCompatible('1.9.9', '2.0.0')).toBe(false);
    expect(isVersionCompatible('3.0.0', '2.0.0')).toBe(false);
    expect(isVersionCompatible(undefined as any, '2.0.0')).toBe(false);
    expect(isVersionCompatible('', '2.0.0')).toBe(false);
  });

  it('saves and loads encoded data cleanly', () => {
    const key = 'mpga_test_players';
    const data = [{ name: 'Alice' }, { name: 'Bob' }];

    saveEncoded(key, data);
    const loaded = loadEncoded(key);

    expect(loaded).toEqual(data);
  });

  it('clears game storage matching prefix', () => {
    saveEncoded('mpga_key1', 'val1');
    saveEncoded('mpga_key2', 'val2');
    localStorage.setItem('other_key', 'keep_me');

    clearGameStorage();

    expect(loadEncoded('mpga_key1')).toBeNull();
    expect(loadEncoded('mpga_key2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep_me');
  });
});
