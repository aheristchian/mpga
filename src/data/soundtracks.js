/**
 * MPGA Soundtrack Configuration.
 *
 * Built-in tracks composed by Ali Heristchian for MPGA gameplay.
 * General audio engine supporting any local MP3 files (/audio/soundtracks/), direct web streams,
 * OneDrive downloads, Suno AI tracks, and remote CDN URLs.
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
    preferLocal: true,
    remoteBaseUrl: 'https://github.com/aheristchian/mpga/releases/download/v1.0.0-audio/',
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
 * Resolves any audio URL (Local path, Suno, OneDrive, SharePoint, or Remote CDN) into a playable stream URL.
 * Automatically converts web pages like `https://suno.com/song/<id>` to `https://cdn1.suno.ai/<id>.mp3`
 * and transforms OneDrive / SharePoint view URLs into direct streaming / download URLs.
 *
 * @param {string} inputUrl
 * @param {string} [remoteBaseUrl] - Optional cloud / OneDrive base URL
 * @returns {string} Direct playable stream URL
 */
export function resolveAudioUrl(inputUrl, remoteBaseUrl = '') {
  if (!inputUrl || typeof inputUrl !== 'string') return '';
  let trimmed = inputUrl.trim();

  // If relative filename and remoteBaseUrl is supplied
  if (remoteBaseUrl && !trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    const cleanBase = remoteBaseUrl.endsWith('/') ? remoteBaseUrl : `${remoteBaseUrl}/`;
    trimmed = `${cleanBase}${trimmed}`;
  }

  // 1. Suno song web URL or UUID format
  const sunoSongMatch = trimmed.match(/suno\.(?:com|ai)\/song\/([a-zA-Z0-9_-]+)/i);
  if (sunoSongMatch && sunoSongMatch[1]) {
    return `https://cdn1.suno.ai/${sunoSongMatch[1]}.mp3`;
  }

  const uuidMatch = trimmed.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) {
    return `https://cdn1.suno.ai/${trimmed}.mp3`;
  }

  // 2. OneDrive / SharePoint stream / download URL transformations
  if (trimmed.includes('onedrive.live.com') || trimmed.includes('sharepoint.com') || trimmed.includes('1drv.ms')) {
    if (trimmed.includes('/view.aspx')) {
      trimmed = trimmed.replace('/view.aspx', '/download.aspx');
    }
    if (trimmed.includes('/redir?')) {
      trimmed = trimmed.replace('/redir?', '/download?');
    }
    if (
      !trimmed.includes('download=1') &&
      !trimmed.includes('download.aspx') &&
      (trimmed.includes('sharepoint.com') || trimmed.includes('onedrive.live.com') || trimmed.includes('1drv.ms'))
    ) {
      trimmed += (trimmed.includes('?') ? '&' : '?') + 'download=1';
    }
    return trimmed;
  }

  // 3. Local root-relative paths for GitHub Pages subpaths (e.g. /mpga/ -> ./audio/...)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${cleanBase}${trimmed.slice(1)}`;
  }

  return trimmed;
}

/**
 * Backward compatibility alias for resolveAudioUrl
 */
export const resolveSunoAudioUrl = resolveAudioUrl;
