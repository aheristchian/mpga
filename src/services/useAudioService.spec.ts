import { describe, it, expect, beforeEach } from 'vitest';
import { useAudio } from './useAudioService';

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

(globalThis as any).localStorage = storageMock;

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

  it('correctly resolves and trims audio URLs', () => {
    const audio = useAudio();

    // Direct URL
    expect(
      audio.resolveAudioUrl(
        'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Night-1.mp3'
      )
    ).toBe('https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Night-1.mp3');

    // URL with whitespace
    expect(audio.resolveAudioUrl('  https://example.com/audio.mp3  ')).toBe(
      'https://example.com/audio.mp3'
    );

    // Empty or non-string input
    expect(audio.resolveAudioUrl('')).toBe('');
    expect(audio.resolveAudioUrl(null as any)).toBe('');
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

  it('handles phase music and track navigation without errors and retains continuous lobby playback', () => {
    const audio = useAudio();
    audio.isMuted.value = false;

    expect(audio.activePhase.value).toBe('lobby');

    // First call triggers lobby music
    audio.playPhaseMusic('lobby');
    expect(audio.activePhase.value).toBe('lobby');
    const initialTrackId = audio.currentTrack.value?.id;

    // Subsequent calls during setup screens retain current track without restarting
    audio.playPhaseMusic('lobby');
    expect(audio.activePhase.value).toBe('lobby');
    expect(audio.currentTrack.value?.id).toBe(initialTrackId);

    expect(() => {
      audio.playPhaseMusic('night');
      audio.playPhaseMusic('midday');
      audio.playPhaseMusic('day');
      audio.playPhaseMusic('voting');
      audio.playPhaseMusic('lobby');
      audio.nextTrack();
      audio.previousTrack();
      audio.pauseMusic();
      audio.resumeMusic();
      audio.stopMusic();
    }).not.toThrow();
  });

  it('correctly handles winner-specific victory music for mafia, town, and third-party', () => {
    const audio = useAudio();
    audio.isMuted.value = false;

    expect(() => {
      audio.playVictoryMusic('mafia');
      expect(audio.currentTrack.value?.winner).toBe('mafia');

      audio.playVictoryMusic('town');
      expect(audio.currentTrack.value?.winner).toBe('town');

      audio.playVictoryMusic('third-party');
      expect(audio.currentTrack.value?.winner).toBe('third-party');
    }).not.toThrow();
  });
});
