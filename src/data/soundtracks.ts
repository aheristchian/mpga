import type { SoundtrackConfig } from '../types';

/**
 * MPGA Soundtrack Configuration.
 *
 * Built-in atmospheric soundtracks composed by Ali Heristchian for MPGA gameplay,
 * streamed directly from GitHub Release CDN audio assets.
 *
 * Victory Tracks:
 * - Victory 1: Mafia Victory
 * - Victory 2: Town Victory
 * - Victory 3: 3rd Party / Nostradamus Victory
 */

export const soundtrackConfig: SoundtrackConfig = {
  settings: {
    defaultVolume: 0.35,
    autoPlayOnPhaseChange: true,
    crossfadeDuration: 1.2,
    loopPlaylist: true,
  },

  playlists: {
    /**
     * 🎲 LOBBY & PREGAME
     */
    lobby: [
      {
        id: 'lobby-1',
        title: 'Lobby 1',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Lobby-1.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'lobby-2',
        title: 'Lobby 2',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Lobby-2.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'lobby-3',
        title: 'Lobby 3',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Lobby-3.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'lobby-4',
        title: 'Lobby 4',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Lobby-4.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'lobby-5',
        title: 'Lobby 5',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Lobby-5.mp3',
        volumeMultiplier: 0.8,
      },
    ],

    /**
     * ☀️ DAY PHASE
     */
    day: [
      {
        id: 'day-1',
        title: 'Day 1',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Day-1.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'day-2',
        title: 'Day 2',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Day-2.mp3',
        volumeMultiplier: 0.8,
      },
    ],

    /**
     * 🗳️ VOTING & TRIAL PHASE
     */
    voting: [
      {
        id: 'trial-1',
        title: 'Trial 1',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Trial-1.mp3',
        volumeMultiplier: 0.85,
      },
      {
        id: 'trial-2',
        title: 'Trial 2',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Trial-2.mp3',
        volumeMultiplier: 0.85,
      },
    ],

    /**
     * ⏳ MIDDAY PHASE (Last Words)
     */
    midday: [
      {
        id: 'midday-1',
        title: 'Midday 1',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Midday-1.mp3',
        volumeMultiplier: 0.8,
      },
    ],

    /**
     * 🌙 NIGHT PHASE
     */
    night: [
      {
        id: 'night-1',
        title: 'Night 1',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Night-1.mp3',
        volumeMultiplier: 0.85,
      },
      {
        id: 'night-2',
        title: 'Night 2',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Night-2.mp3',
        volumeMultiplier: 0.85,
      },
    ],

    /**
     * 🏆 VICTORY & GAME OVER
     * Win 1: Mafia, Win 2: Town, Win 3: 3rd Party
     */
    victory: [
      {
        id: 'victory-mafia',
        title: 'Win 1 (Mafia Victory)',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Victory-1.mp3',
        winner: 'mafia',
        volumeMultiplier: 0.9,
      },
      {
        id: 'victory-town',
        title: 'Win 2 (Town Victory)',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Victory-2.mp3',
        winner: 'town',
        volumeMultiplier: 0.9,
      },
      {
        id: 'victory-third-party',
        title: 'Win 3 (Third Party Victory)',
        artist: 'Ali Heristchian',
        url: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/Victory-3.mp3',
        winner: 'third-party',
        volumeMultiplier: 0.9,
      },
    ],
  },
};

/**
 * Resolves an audio URL for playback.
 */
export function resolveAudioUrl(inputUrl?: string | null): string {
  if (!inputUrl || typeof inputUrl !== 'string') return '';
  return inputUrl.trim();
}
