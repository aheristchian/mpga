import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWakeLock } from './useWakeLock';

describe('useWakeLock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default status', () => {
    const { isSupported, isActive, isAutoEnabled } = useWakeLock();
    expect(typeof isSupported).toBe('boolean');
    expect(isActive.value).toBe(false);
    expect(isAutoEnabled.value).toBe(true);
  });

  it('handles toggleWakeLock toggling auto-enabled status', async () => {
    const { isAutoEnabled, toggleWakeLock } = useWakeLock();
    expect(isAutoEnabled.value).toBe(true);
    await toggleWakeLock();
    expect(isAutoEnabled.value).toBe(false);
    await toggleWakeLock();
    expect(isAutoEnabled.value).toBe(true);
  });
});
