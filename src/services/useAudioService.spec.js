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

  it('correctly resolves Suno song web URLs to direct playable CDN stream URLs', () => {
    const audio = useAudio();

    // Standard suno.com/song/<id>
    expect(audio.resolveSunoAudioUrl('https://suno.com/song/0712a149-2b4a-466d-b8d9-1365c71a3e6f')).toBe(
      'https://cdn1.suno.ai/0712a149-2b4a-466d-b8d9-1365c71a3e6f.mp3'
    );

    // Direct CDN URL remains intact
    expect(audio.resolveSunoAudioUrl('https://cdn1.suno.ai/0712a149-2b4a-466d-b8d9-1365c71a3e6f.mp3')).toBe(
      'https://cdn1.suno.ai/0712a149-2b4a-466d-b8d9-1365c71a3e6f.mp3'
    );

    // Empty or non-string input
    expect(audio.resolveSunoAudioUrl('')).toBe('');
    expect(audio.resolveSunoAudioUrl(null)).toBe('');
  });

  it('manages music volume and autoplay settings with localStorage persistence', () => {
    const audio = useAudio();

    audio.setMusicVolume(0.65);
    expect(audio.musicVolume.value).toBe(0.65);
    expect(localStorage.getItem('mpga_music_volume')).toBe('0.65');

    audio.setAutoPlay(false);
    expect(audio.autoPlayOnPhaseChange.value).toBe(false);
    expect(localStorage.getItem('mpga_music_autoplay')).toBe('false');

    audio.setAutoPlay(true);
    expect(audio.autoPlayOnPhaseChange.value).toBe(true);
  });

  it('handles phase music and track navigation without errors', () => {
    const audio = useAudio();
    audio.isMuted.value = false;

    expect(() => {
      audio.playPhaseMusic('night');
      audio.nextTrack();
      audio.previousTrack();
      audio.pauseMusic();
      audio.resumeMusic();
      audio.stopMusic();
    }).not.toThrow();
  });
});
