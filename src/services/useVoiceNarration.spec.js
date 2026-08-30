import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVoiceNarration } from './useVoiceNarration';

describe('Voice Narration Service (useVoiceNarration.js)', () => {
  beforeEach(() => {
    globalThis.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
    };
    globalThis.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
        this.lang = 'en-US';
        this.volume = 1.0;
        this.rate = 1.0;
      }
    };
  });

  it('initializes and manages enabled state and toggling', () => {
    const narration = useVoiceNarration();
    narration.setEnabled(false);
    expect(narration.isEnabled.value).toBe(false);

    narration.toggleEnabled();
    expect(narration.isEnabled.value).toBe(true);

    narration.toggleEnabled();
    expect(narration.isEnabled.value).toBe(false);
  });

  it('triggers speech when enabled', () => {
    const narration = useVoiceNarration();
    narration.setEnabled(true);

    narration.speak('Doctor wake up', 'en-US');
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();

    narration.stop();
    expect(globalThis.speechSynthesis.cancel).toHaveBeenCalled();
  });
});
