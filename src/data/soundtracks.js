/**
 * MPGA Soundtrack Configuration.
 *
 * Soundtracks created by Ali Heristchian in Suno AI for MPGA gameplay.
 * Local MP3s are stored in /audio/soundtracks/ (offline-ready & instant playback).
 *
 * Victory Tracks:
 * - Victory 1: Mafia Victory
 * - Victory 2: Town Victory
 * - Victory 3: 3rd Party / Nostradamus Victory
 */

export const soundtrackConfig = {
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
        url: '/audio/soundtracks/Lobby-1.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'lobby-2',
        title: 'Lobby 2',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Lobby-2.mp3',
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
        url: '/audio/soundtracks/Day-1.mp3',
        volumeMultiplier: 0.8,
      },
      {
        id: 'day-2',
        title: 'Day 2',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Day-2.mp3',
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
        url: '/audio/soundtracks/Trial-1.mp3',
        volumeMultiplier: 0.85,
      },
      {
        id: 'trial-2',
        title: 'Trial 2',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Trial-2.mp3',
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
        url: '/audio/soundtracks/Midday-1.mp3',
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
        url: '/audio/soundtracks/Night-1.mp3',
        volumeMultiplier: 0.85,
      },
      {
        id: 'night-2',
        title: 'Night 2',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Night-2.mp3',
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
        title: 'Mafia Victory (Win 1)',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Victory-1.mp3',
        winner: 'mafia',
        volumeMultiplier: 0.9,
      },
      {
        id: 'victory-town',
        title: 'Town Victory (Win 2)',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Victory-2.mp3',
        winner: 'town',
        volumeMultiplier: 0.9,
      },
      {
        id: 'victory-third-party',
        title: 'Third Party Victory (Win 3)',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Victory-3.mp3',
        winner: 'third-party',
        volumeMultiplier: 0.9,
      },
    ],
  },
};

/**
 * Resolves any Suno URL or local path into a playable audio URL.
 * Automatically converts web pages like `https://suno.com/song/<id>` to `https://cdn1.suno.ai/<id>.mp3`
 *
 * @param {string} inputUrl
 * @returns {string} Direct playable stream URL
 */
export function resolveSunoAudioUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') return '';
  const trimmed = inputUrl.trim();

  // Match suno.com/song/<uuid> or suno.ai/song/<uuid>
  const sunoSongMatch = trimmed.match(/suno\.(?:com|ai)\/song\/([a-zA-Z0-9_-]+)/i);
  if (sunoSongMatch && sunoSongMatch[1]) {
    const songId = sunoSongMatch[1];
    return `https://cdn1.suno.ai/${songId}.mp3`;
  }

  // Match raw UUID string (e.g., c6d61f1b-b9d7-4106-843c-b9b9743ca3e6)
  const uuidMatch = trimmed.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    return `https://cdn1.suno.ai/${trimmed}.mp3`;
  }

  // Handle local root-relative paths for GitHub Pages subpaths (e.g. /mpga/ -> ./audio/...)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${cleanBase}${trimmed.slice(1)}`;
  }

  return trimmed;
}
