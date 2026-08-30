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

    // Raw UUID format
    expect(audio.resolveSunoAudioUrl('c6d61f1b-b9d7-4106-843c-b9b9743ca3e6')).toBe(
      'https://cdn1.suno.ai/c6d61f1b-b9d7-4106-843c-b9b9743ca3e6.mp3'
    );

    // Empty or non-string input
    expect(audio.resolveSunoAudioUrl('')).toBe('');
    expect(audio.resolveSunoAudioUrl(null)).toBe('');
  });

  it('correctly resolves OneDrive, Suno, and relative audio URLs to streaming links', () => {
    const audio = useAudio();

    // Standard suno.com/song/<id>
    expect(audio.resolveAudioUrl('https://suno.com/song/0712a149-2b4a-466d-b8d9-1365c71a3e6f')).toBe(
      'https://cdn1.suno.ai/0712a149-2b4a-466d-b8d9-1365c71a3e6f.mp3'
    );

    // OneDrive view.aspx -> download.aspx
    expect(
      audio.resolveAudioUrl('https://onedrive.live.com/view.aspx?resid=12345&authkey=!abc')
    ).toBe('https://onedrive.live.com/download.aspx?resid=12345&authkey=!abc');

    // OneDrive query param download=1
    expect(
      audio.resolveAudioUrl('https://1drv.ms/u/s!Al_something')
    ).toBe('https://1drv.ms/u/s!Al_something?download=1');

    // OneDrive with existing query params gets &download=1
    expect(
      audio.resolveAudioUrl('https://1drv.ms/u/s!Al_something?e=xyz')
    ).toBe('https://1drv.ms/u/s!Al_something?e=xyz&download=1');

    // Relative remote file with remoteBaseUrl
    expect(
      audio.resolveAudioUrl('Night-1.mp3', 'https://mycloud.example.com/audio/')
    ).toBe('https://mycloud.example.com/audio/Night-1.mp3');

    // Empty or non-string input
    expect(audio.resolveAudioUrl('')).toBe('');
    expect(audio.resolveAudioUrl(null)).toBe('');
  });

  it('manages preferLocal and remoteBaseUrl settings with localStorage persistence', () => {
    const audio = useAudio();

    audio.setPreferLocal(false);
    expect(audio.preferLocal.value).toBe(false);
    expect(localStorage.getItem('mpga_audio_prefer_local')).toBe('false');

    audio.setPreferLocal(true);
    expect(audio.preferLocal.value).toBe(true);
    expect(localStorage.getItem('mpga_audio_prefer_local')).toBe('true');

    audio.setRemoteBaseUrl('https://onedrive.live.com/download?resid=XYZ');
    expect(audio.remoteBaseUrl.value).toBe('https://onedrive.live.com/download?resid=XYZ');
    expect(localStorage.getItem('mpga_audio_remote_base_url')).toBe('https://onedrive.live.com/download?resid=XYZ');
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
