import { describe, it, expect, vi } from 'vitest';
import { useHaptics } from './useHaptics';

describe('useHaptics', () => {
  it('initializes and provides vibration methods without crashing', () => {
    const { isSupported, vibrateLight, vibrateSuccess, vibrateWarning, vibrateNightCall } =
      useHaptics();
    expect(typeof isSupported).toBe('boolean');

    // Should not throw even in Node/test environments
    expect(() => vibrateLight()).not.toThrow();
    expect(() => vibrateSuccess()).not.toThrow();
    expect(() => vibrateWarning()).not.toThrow();
    expect(() => vibrateNightCall()).not.toThrow();
  });
});
