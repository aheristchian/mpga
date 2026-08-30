import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVoiceNarration } from './useVoiceNarration';

describe('Voice Narration Service (useVoiceNarration.ts)', () => {
  beforeEach(() => {
    (globalThis as any).speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => []),
    };
    (globalThis as any).SpeechSynthesisUtterance = class {
      text: string;
      lang: string;
      volume: number;
      rate: number;
      constructor(text: string) {
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
    expect((globalThis as any).speechSynthesis.speak).toHaveBeenCalled();

    narration.stop();
    expect((globalThis as any).speechSynthesis.cancel).toHaveBeenCalled();
  });
});
