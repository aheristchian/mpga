export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  volumeMultiplier?: number;
  winner?: string;
}

export interface SoundtrackPlaylists {
  lobby: SoundtrackTrack[];
  day: SoundtrackTrack[];
  voting: SoundtrackTrack[];
  midday: SoundtrackTrack[];
  night: SoundtrackTrack[];
  victory: SoundtrackTrack[];
}

export interface SoundtrackConfig {
  settings: {
    defaultVolume: number;
    autoPlayOnPhaseChange: boolean;
    crossfadeDuration: number;
    loopPlaylist: boolean;
  };
  playlists: SoundtrackPlaylists;
}

export type AudioPhase = 'lobby' | 'day' | 'voting' | 'midday' | 'night' | 'victory';

export type SoundEffectId =
  | 'timer_tick'
  | 'timer_bell'
  | 'vote_registered'
  | 'gunshot'
  | 'night_fall'
  | 'day_break'
  | 'error'
  | string;
