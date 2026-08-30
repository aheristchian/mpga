/**
 * MPGA Soundtrack Configuration.
 *
 * Built-in tracks composed by Ali Heristchian for MPGA gameplay.
 * General audio engine supporting any local MP3 files (/audio/soundtracks/), direct web streams,
 * OneDrive downloads, Suno AI tracks, and remote CDN URLs.
 *
 * Victory Tracks:
 * - Victory 1: Mafia Victory (Win 1)
 * - Victory 2: Town Victory (Win 2)
 * - Victory 3: 3rd Party / Nostradamus Victory (Win 3)
 */

export const soundtrackConfig = {
  settings: {
    defaultVolume: 0.35,
    autoPlayOnPhaseChange: true,
    crossfadeDuration: 1.2,
    loopPlaylist: true,
    preferLocal: true,
    remoteBaseUrl: '', // Optional OneDrive / Cloud storage base URL (e.g. https://onedrive.live.com/...)
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
        localUrl: '/audio/soundtracks/Lobby-1.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQR2CGFmMzeJS7qwQ_4vta1zAblLvIa8Aegz8K_LGcPGARI',
        volumeMultiplier: 0.8,
      },
      {
        id: 'lobby-2',
        title: 'Lobby 2',
        artist: 'Ali Heristchian',
        localUrl: '/audio/soundtracks/Lobby-2.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQSSGIXwqN2LSLGQUpNtKMJnAVPYlJ_7lfq7uBD2vMtwwdA',
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
        localUrl: '/audio/soundtracks/Day-1.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQSAeIC5C00nRozoZ9mo1_edAaWIvSnBPgbkkPU_CbD62Nc',
        volumeMultiplier: 0.8,
      },
      {
        id: 'day-2',
        title: 'Day 2',
        artist: 'Ali Heristchian',
        localUrl: '/audio/soundtracks/Day-2.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQRgOLOFyZFUTowSQPaFR8QtAUBv6b91eAw9kDakwkpE3tE',
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
        localUrl: '/audio/soundtracks/Trial-1.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQThfXd1TRXXRJETbHFZSP4nAVkggAlfQba0aCOyfuYoQSQ',
        volumeMultiplier: 0.85,
      },
      {
        id: 'trial-2',
        title: 'Trial 2',
        artist: 'Ali Heristchian',
        localUrl: '/audio/soundtracks/Trial-2.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQT30M8aQ0LRQ6zQ6Rmb4-98AQLKuimPc70k5Gh3bpfw5V8',
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
        localUrl: '/audio/soundtracks/Midday-1.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQQzk7sA27V0SZCu9XYVbdsoAYQ_MeGo73pHW7XuubkBhcg',
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
        localUrl: '/audio/soundtracks/Night-1.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQSYMt6tfMejQowlGMo0DsMuAdUK_okJX7cMy0FGpcKmeBs',
        volumeMultiplier: 0.85,
      },
      {
        id: 'night-2',
        title: 'Night 2',
        artist: 'Ali Heristchian',
        localUrl: '/audio/soundtracks/Night-2.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQT_zRSeToTkRYesOT5OW-jfAfFcRd0nTHlsBt3ODVHVszo',
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
        localUrl: '/audio/soundtracks/Victory-1.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQRPyPoOlQDpQ4e_ICWZTJ_-AUsLWyp5uTc4n9GQz45y41A',
        winner: 'mafia',
        volumeMultiplier: 0.9,
      },
      {
        id: 'victory-town',
        title: 'Win 2 (Town Victory)',
        artist: 'Ali Heristchian',
        localUrl: '/audio/soundtracks/Victory-2.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQT8zm40jslzSr1V0nCsAdPBARIWadF1ITrAAiBPUejX5Jg',
        winner: 'town',
        volumeMultiplier: 0.9,
      },
      {
        id: 'victory-third-party',
        title: 'Win 3 (Third Party Victory)',
        artist: 'Ali Heristchian',
        localUrl: '/audio/soundtracks/Victory-3.mp3',
        onlineUrl: 'https://1drv.ms/u/c/8c71a8dd4e180e9b/IQR5ktX7N5-lSJX61rJfXGzxAb3oYWZUpUXO_Nldm0BcB48',
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
