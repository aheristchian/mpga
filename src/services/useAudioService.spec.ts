import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

  describe('Audio Stream Singleton & Rapid Phase-Shift / Undo Lifecycle', () => {
    let mockInstances: MockAudio[] = [];

    class MockAudio {
      src = '';
      loop = false;
      volume = 1;
      paused = true;
      listeners: Record<string, Function[]> = {};

      constructor(src?: string) {
        if (src) this.src = src;
        mockInstances.push(this);
      }

      addEventListener(event: string, fn: Function) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(fn);
      }

      removeEventListener(event: string, fn: Function) {
        if (this.listeners[event]) {
          this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
        }
      }

      play = vi.fn().mockImplementation(() => {
        this.paused = false;
        return Promise.resolve();
      });

      pause = vi.fn().mockImplementation(() => {
        this.paused = true;
      });

      load = vi.fn();
    }

    beforeEach(() => {
      mockInstances = [];
      (globalThis as any).Audio = MockAudio;
      (globalThis as any).window = globalThis;
    });

    afterEach(() => {
      delete (globalThis as any).Audio;
    });

    it('tears down earlier audio elements when rapid phase shifts occur', async () => {
      const audio = useAudio();
      audio.isMuted.value = false;

      // Simulate rapid phase shifts: day -> voting -> night
      audio.playPhaseMusic('day', { fade: false });
      audio.playPhaseMusic('voting', { fade: false });
      audio.playPhaseMusic('night', { fade: false });

      // Allow microtasks to resolve promises
      await Promise.resolve();

      expect(mockInstances.length).toBeGreaterThan(1);
      // All earlier instances must be paused and their src cleared
      const earlierInstances = mockInstances.slice(0, -1);
      for (const instance of earlierInstances) {
        expect(instance.pause).toHaveBeenCalled();
        expect(instance.src).toBe('');
      }

      // The latest instance must be the active one
      const latestInstance = mockInstances[mockInstances.length - 1];
      expect(latestInstance.paused).toBe(false);
      expect(audio.isPlayingMusic.value).toBe(true);
      expect(audio.activePhase.value).toBe('night');
    });

    it('kills stale in-flight promises that resolve after a newer phase was requested', async () => {
      const audio = useAudio();
      audio.isMuted.value = false;

      let resolveSlowTrack: () => void = () => {};
      const slowPromise = new Promise<void>((resolve) => {
        resolveSlowTrack = resolve;
      });

      // Call track 1 with a delayed play resolution
      const track1 = {
        id: 'track1',
        title: 'Slow Track',
        url: 'https://example.com/slow.mp3',
        phase: 'day' as const,
      };

      // Custom play implementation for the slow audio element
      let firstInstance: MockAudio | null = null;
      (globalThis as any).Audio = class extends MockAudio {
        constructor(src?: string) {
          super(src);
          if (!firstInstance) {
            firstInstance = this;
            this.play = vi.fn().mockImplementation(() => slowPromise);
          }
        }
      };

      audio.playTrack(track1, { fade: false });

      // Before slow track resolves, an undo or quick phase shift to track 2 occurs
      const track2 = {
        id: 'track2',
        title: 'Fast Track',
        url: 'https://example.com/fast.mp3',
        phase: 'night' as const,
      };
      audio.playTrack(track2, { fade: false });

      await Promise.resolve();

      // Now resolve the slow track from track 1
      resolveSlowTrack();
      await Promise.resolve();

      // The slow track must have been killed and cleared
      expect(firstInstance).not.toBeNull();
      expect(firstInstance!.pause).toHaveBeenCalled();
      expect(firstInstance!.src).toBe('');
      expect(audio.currentTrack.value?.id).toBe('track2');
    });

    it('stopMusic immediately pauses and clears all active and pending audio elements', async () => {
      const audio = useAudio();
      audio.isMuted.value = false;

      audio.playPhaseMusic('day', { fade: false });
      await Promise.resolve();

      const activeInstance = mockInstances[mockInstances.length - 1];
      expect(activeInstance.paused).toBe(false);

      audio.stopMusic({ fade: false });

      expect(activeInstance.pause).toHaveBeenCalled();
      expect(activeInstance.src).toBe('');
      expect(audio.isPlayingMusic.value).toBe(false);
      expect(audio.currentTrack.value).toBeNull();
    });
  });
});
