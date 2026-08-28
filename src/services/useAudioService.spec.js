import { describe, it, expect, beforeEach } from 'vitest';
import { useAudio } from './useAudioService';

const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();

globalThis.localStorage = storageMock;

describe('useAudioService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes and toggles mute state properly', () => {
    const audio = useAudio();
    const initialMute = audio.isMuted.value;

    audio.toggleMute();
    expect(audio.isMuted.value).toBe(!initialMute);
    expect(localStorage.getItem('mpga_audio_muted')).toBe(String(!initialMute));

    audio.toggleMute();
    expect(audio.isMuted.value).toBe(initialMute);
  });

  it('safely calls play methods without crashing in non-browser or muted environments', () => {
    const audio = useAudio();
    audio.isMuted.value = true;

    expect(() => {
      audio.playTick();
      audio.playUrgentTick();
      audio.playGong();
      audio.playNightFall();
      audio.playDawnRise();
      audio.playRouletteTick();
      audio.playFanfare();
      audio.playVoteClick();
    }).not.toThrow();
  });
});
