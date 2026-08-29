/**
 * MPGA Soundtrack & Suno Music Configuration.
 *
 * This configuration file defines the playlists for each game phase and scenario.
 * You can add your downloaded Suno MP3s, public CDN streams, or any MP3 files.
 *
 * Supported URL formats:
 * - Local MP3 in public directory: "/audio/soundtracks/speakeasy.mp3" (Recommended for offline & instant play)
 * - Any standard MP3 / AAC / WAV stream URL: "https://my-server.com/music/track.mp3"
 * - Public CDN or GitHub Raw audio stream
 */

export const soundtrackConfig = {
  // Global audio playback settings
  settings: {
    defaultVolume: 0.35, // Volume scale 0.0 to 1.0
    autoPlayOnPhaseChange: true, // Automatically change music when game phase changes
    crossfadeDuration: 1.2, // Crossfade transition in seconds
    loopPlaylist: true, // Continuous loop through the phase playlist
  },

  // Playlists organized by game phase / scene
  playlists: {
    /**
     * 🌙 NIGHT PHASE (Dark Noir, Mystery, Ambient, Suspense)
     * Plays while players close their eyes and night abilities are cast.
     */
    night: [
      {
        id: 'night-noir-1',
        title: 'Shadows in the Fog (Noir Ambient)',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/0712a149-2b4a-466d-b8d9-1365c71a3e6f.mp3',
        description: 'Atmospheric dark noir jazz & slow cello suspense',
        volumeMultiplier: 0.85,
      },
      {
        id: 'night-noir-2',
        title: 'Whispers of the Don',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/1183c52a-89a1-420a-b6e9-23c72b146820.mp3',
        description: 'Low-frequency drone with subtle piano chords',
        volumeMultiplier: 0.8,
      },
    ],

    /**
     * ☀️ DAY PHASE (Debate, Speeches, Ticking Clock Tension)
     * Plays during player turn speeches and open discussions.
     */
    day: [
      {
        id: 'day-debate-1',
        title: 'Courtroom Tension & Ticking Clock',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/44a19b82-9012-4c22-99ab-62a9390f7721.mp3',
        description: 'Rhythmic acoustic tension with clock pulse',
        volumeMultiplier: 0.75,
      },
      {
        id: 'day-debate-2',
        title: 'Trial of Truth',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/55b28c31-9012-4d22-99ab-77c88a149021.mp3',
        description: 'Subtle cinematic pulse and investigation tempo',
        volumeMultiplier: 0.7,
      },
    ],

    /**
     * 🗳️ VOTING & DEFENSE PHASE (High Stakes, Accusations, Guillotine)
     * Plays during primary voting, runoff defense, and elimination roulette.
     */
    voting: [
      {
        id: 'voting-trial-1',
        title: 'Judgement Hour (High Stakes Trial)',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/77b819f2-2244-4819-a9a3-55919ac90019.mp3',
        description: 'Intense cinematic strings and ominous heavy percussion',
        volumeMultiplier: 0.9,
      },
      {
        id: 'voting-trial-2',
        title: 'The Final Defense',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/88c920f3-3355-4920-ba4b-66020bd01120.mp3',
        description: 'Fast-paced heartbeat pulse and building climax',
        volumeMultiplier: 0.85,
      },
    ],

    /**
     * 🏆 VICTORY & GAME OVER (Mafia Victory / Town Victory / Nostradamus Triumph)
     * Plays on victory screen and match summary.
     */
    victory: [
      {
        id: 'victory-anthem-1',
        title: 'Final Reckoning (Victory Theme)',
        artist: 'Suno AI',
        url: 'https://cdn1.suno.ai/99d031e4-4466-4a31-cb5c-77131ce12231.mp3',
        description: 'Triumphant noir brass fanfare and closing chords',
        volumeMultiplier: 1.0,
      },
    ],

    /**
     * 🎲 LOBBY & PREGAME (Setup, Seating, Role Selection)
     * Plays while players connect devices and configure roles.
     */
    lobby: [
      {
        id: 'lobby-theme-1',
        title: 'Midnight in the Speakeasy',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Midnight in the Speakeasy.mp3',
        description: '1930s Speakeasy Lounge Jazz',
        volumeMultiplier: 0.7,
      },
      {
        id: 'lobby-theme-2',
        title: 'Midnight Dust',
        artist: 'Ali Heristchian',
        url: '/audio/soundtracks/Midnight Dust.mp3',
        description: 'Modern Lo-Fi Mafia Beats',
        volumeMultiplier: 0.7,
      },
    ],
  },
};

/**
 * Resolves any Suno URL into a direct playable CDN audio URL.
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
