import { ref } from 'vue';
import { soundtrackConfig, resolveAudioUrl } from '../data/soundtracks';
import type { SoundtrackTrack, SoundtrackPlaylists, AudioPhase } from '../types';

// Persisted audio states
const isMuted = ref<boolean>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_audio_muted') === 'true' : false
);

const musicVolume = ref<number>(
  typeof localStorage !== 'undefined' && localStorage.getItem('mpga_music_volume') !== null
    ? parseFloat(localStorage.getItem('mpga_music_volume') || '0.35')
    : soundtrackConfig.settings.defaultVolume
);

const autoPlayOnPhaseChange = ref<boolean>(
  typeof localStorage !== 'undefined' && localStorage.getItem('mpga_music_autoplay') !== null
    ? localStorage.getItem('mpga_music_autoplay') === 'true'
    : soundtrackConfig.settings.autoPlayOnPhaseChange
);

// Current Track & Playback Status
const currentTrack = ref<SoundtrackTrack | null>(null);
const isPlayingMusic = ref<boolean>(false);
const activePhase = ref<AudioPhase | string>('lobby');
const playlists = ref<SoundtrackPlaylists>(JSON.parse(JSON.stringify(soundtrackConfig.playlists)));

// Audio Elements & Web Audio Context
let audioCtx: AudioContext | null = null;

// Singleton Audio Player State Management
let currentPlaybackRequestId = 0;
let currentAudioEl: HTMLAudioElement | null = null;
let pendingAudioEl: HTMLAudioElement | null = null;
const fadingAudioEls = new Map<HTMLAudioElement, ReturnType<typeof setInterval>>();

/**
 * Deterministically tears down an HTMLAudioElement.
 * Strips event listeners, cancels fader timers, and releases audio decoders.
 */
function teardownAudioElement(
  audioEl: HTMLAudioElement | null | undefined,
  options: { immediate?: boolean; fadeDurationMs?: number } = { immediate: true }
) {
  if (!audioEl) return;

  const existingFader = fadingAudioEls.get(audioEl);
  if (existingFader) {
    clearInterval(existingFader);
    fadingAudioEls.delete(audioEl);
  }

  if (options.immediate) {
    try {
      audioEl.pause();
      audioEl.onended = null;
      audioEl.onerror = null;
      audioEl.src = '';
      if (typeof audioEl.load === 'function') {
        audioEl.load();
      }
    } catch {
      // Graceful fallback for mocked or restricted environments
    }
    return;
  }

  const startVol = audioEl.volume;
  const durationMs = options.fadeDurationMs ?? 1000;

  const fader = fadeAudioElement(audioEl, startVol, 0, durationMs, () => {
    fadingAudioEls.delete(audioEl);
    try {
      audioEl.pause();
      audioEl.onended = null;
      audioEl.onerror = null;
      audioEl.src = '';
      if (typeof audioEl.load === 'function') {
        audioEl.load();
      }
    } catch {
      // Graceful fallback
    }
  });

  if (fader) {
    fadingAudioEls.set(audioEl, fader);
  }
}

/**
 * Immediately tears down all in-flight pending or fading orphan audio elements.
 */
function teardownAllOrphans() {
  if (pendingAudioEl) {
    teardownAudioElement(pendingAudioEl, { immediate: true });
    pendingAudioEl = null;
  }

  for (const [el] of fadingAudioEls) {
    teardownAudioElement(el, { immediate: true });
  }
  fadingAudioEls.clear();
}

/**
 * Smoothly ramps an HTMLAudioElement's volume from fromVol to toVol over durationMs.
 * Uses trigonometric sine easing for natural perceptual volume linearity.
 * Calls onComplete when finished.
 */
function fadeAudioElement(
  audioEl: HTMLAudioElement | null,
  fromVol: number,
  toVol: number,
  durationMs: number = 1500,
  onComplete: (() => void) | null = null
): ReturnType<typeof setInterval> | null {
  if (!audioEl) {
    if (onComplete) onComplete();
    return null;
  }
  const steps = 30;
  const intervalTime = Math.max(16, Math.floor(durationMs / steps));
  let step = 0;

  try {
    audioEl.volume = Math.max(0, Math.min(1, fromVol));
  } catch {
    // Ignore volume clamp error on detached elements
  }

  const timer = setInterval(() => {
    step++;
    const progress = Math.min(1, step / steps);
    const easedProgress = Math.sin((progress * Math.PI) / 2);
    const currentVol = fromVol + (toVol - fromVol) * easedProgress;

    if (audioEl) {
      try {
        audioEl.volume = Math.max(0, Math.min(1, currentVol));
      } catch {
        // Element might be detached or closed
      }
    }

    if (step >= steps) {
      clearInterval(timer);
      if (audioEl) {
        try {
          audioEl.volume = Math.max(0, Math.min(1, toVol));
        } catch {
          // Element might be detached
        }
      }
      if (onComplete) onComplete();
    }
  }, intervalTime);

  return timer;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function useAudio() {
  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_audio_muted', isMuted.value ? 'true' : 'false');
    }
    if (isMuted.value) {
      currentPlaybackRequestId++;
      teardownAllOrphans();
      if (currentAudioEl) {
        pauseMusic({ fade: true });
      }
    } else if (!isMuted.value && currentTrack.value && !isPlayingMusic.value) {
      resumeMusic({ fade: true });
    }
  };

  const setMusicVolume = (vol: number | string) => {
    const clamped = Math.max(0, Math.min(1, parseFloat(String(vol)) || 0));
    musicVolume.value = clamped;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_music_volume', String(clamped));
    }
    const multiplier = currentTrack.value?.volumeMultiplier || 1.0;
    if (currentAudioEl && !isMuted.value) {
      try {
        currentAudioEl.volume = clamped * multiplier;
      } catch {
        // ignore
      }
    }
    if (pendingAudioEl && !isMuted.value) {
      try {
        pendingAudioEl.volume = clamped * multiplier;
      } catch {
        // ignore
      }
    }
  };

  const setAutoPlay = (enabled: boolean) => {
    autoPlayOnPhaseChange.value = Boolean(enabled);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_music_autoplay', String(autoPlayOnPhaseChange.value));
    }
  };

  /**
   * Internal stream player with strict singleton lifecycle and seamless crossfade
   */
  const playStream = (
    streamUrl: string,
    track: SoundtrackTrack,
    options: { fade?: boolean } = { fade: true }
  ) => {
    if (!streamUrl || isMuted.value) return;

    // Continue uninterrupted if already playing this exact track
    if (
      currentTrack.value?.id === track.id &&
      isPlayingMusic.value &&
      currentAudioEl &&
      !currentAudioEl.paused
    ) {
      return;
    }

    if (typeof window === 'undefined' || typeof window.Audio === 'undefined') {
      currentTrack.value = track;
      isPlayingMusic.value = true;
      return;
    }

    try {
      // 1. Advance request ID token to supersede all previous in-flight requests
      const requestId = ++currentPlaybackRequestId;

      // 2. Immediately teardown all in-flight pending and previous orphan audio elements
      teardownAllOrphans();

      const oldAudio = currentAudioEl;
      const targetVol = musicVolume.value * (track.volumeMultiplier || 1.0);
      const crossfadeMs = (soundtrackConfig.settings.crossfadeDuration || 1.5) * 1000;

      // 3. Gracefully teardown old active audio (fade-out or immediate)
      if (oldAudio) {
        if (options.fade && !oldAudio.paused) {
          teardownAudioElement(oldAudio, { immediate: false, fadeDurationMs: crossfadeMs });
        } else {
          teardownAudioElement(oldAudio, { immediate: true });
        }
        currentAudioEl = null;
      }

      // 4. Instantiate new audio element as pending
      const newAudio = new Audio(streamUrl);
      newAudio.loop = false;
      newAudio.volume = options.fade ? 0.001 : targetVol;
      pendingAudioEl = newAudio;

      const handleEnded = () => {
        if (currentAudioEl === newAudio && requestId === currentPlaybackRequestId) {
          nextTrack();
        }
      };

      const handleError = (err: Event | string) => {
        if (requestId === currentPlaybackRequestId) {
          console.warn(`[MPGA Audio] Error playing track "${track.title}" (${streamUrl}):`, err);
          if (currentAudioEl === newAudio) {
            isPlayingMusic.value = false;
          }
          if (pendingAudioEl === newAudio) {
            pendingAudioEl = null;
          }
        }
      };

      newAudio.addEventListener('ended', handleEnded);
      newAudio.addEventListener('error', handleError);

      newAudio
        .play()
        .then(() => {
          // If a newer playback request was initiated while .play() was resolving, kill this element immediately!
          if (requestId !== currentPlaybackRequestId) {
            teardownAudioElement(newAudio, { immediate: true });
            return;
          }

          // Successfully promote to active singleton
          pendingAudioEl = null;
          currentAudioEl = newAudio;
          currentTrack.value = track;
          isPlayingMusic.value = true;

          // Crossfade: gracefully fade in new track
          if (options.fade) {
            fadeAudioElement(newAudio, 0.001, targetVol, crossfadeMs);
          } else {
            newAudio.volume = targetVol;
          }
        })
        .catch((e) => {
          if (requestId === currentPlaybackRequestId) {
            console.warn('[MPGA Audio] Playback prevented by browser autoplay policy:', e);
            if (pendingAudioEl === newAudio) {
              pendingAudioEl = null;
            }
            isPlayingMusic.value = false;
          }
        });
    } catch (e) {
      console.warn('[MPGA Audio] Audio instantiation failed:', e);
    }
  };

  /**
   * Plays a specific track object with smart URL resolution
   */
  const playTrack = (track: SoundtrackTrack, options: { fade?: boolean } = { fade: true }) => {
    if (!track || isMuted.value) return;

    const rawUrl = track.url || '';
    if (!rawUrl || rawUrl.endsWith('_')) return;

    const primaryUrl = resolveAudioUrl(rawUrl);
    if (!primaryUrl) return;

    playStream(primaryUrl, track, options);
  };

  /**
   * Plays music for a given phase (e.g. 'lobby', 'day', 'voting', 'midday', 'night', 'victory')
   * If music is already playing for this active phase, playback continues uninterrupted.
   */
  const playPhaseMusic = (
    phaseKey: string,
    options: { fade?: boolean; random?: boolean } = { fade: true, random: true }
  ) => {
    if (!phaseKey) return;

    // Continue uninterrupted if already playing within this phase category
    if (
      activePhase.value === phaseKey &&
      isPlayingMusic.value &&
      (!currentAudioEl || !currentAudioEl.paused)
    ) {
      return;
    }

    activePhase.value = phaseKey;

    const playlistGroup = (playlists.value as Record<string, SoundtrackTrack[]>)[phaseKey] || [];
    const phasePlaylist = playlistGroup.filter((t) => Boolean(t.url) && !t.url.endsWith('_'));
    if (phasePlaylist.length === 0) return;

    let playableTrack: SoundtrackTrack | undefined;
    if (options.random !== false && phasePlaylist.length > 1) {
      // Pick a random track from this phase (prefer different from the currently playing track)
      const otherTracks = phasePlaylist.filter((t) => t.id !== currentTrack.value?.id);
      const candidates = otherTracks.length > 0 ? otherTracks : phasePlaylist;
      const randIdx = Math.floor(Math.random() * candidates.length);
      playableTrack = candidates[randIdx];
    } else {
      playableTrack = phasePlaylist[0];
    }

    if (playableTrack) {
      playTrack(playableTrack, options);
    }
  };

  /**
   * Plays winner-specific victory theme (Mafia -> Win 1, Town -> Win 2, 3rd Party -> Win 3)
   */
  const playVictoryMusic = (
    winnerSide: string = 'town',
    options: { fade?: boolean } = { fade: true }
  ) => {
    const side = String(winnerSide || 'town').toLowerCase();

    // Continue uninterrupted if victory theme for the SAME winner is already playing
    if (
      activePhase.value === 'victory' &&
      isPlayingMusic.value &&
      currentTrack.value?.winner === side &&
      (!currentAudioEl || !currentAudioEl.paused)
    ) {
      return;
    }

    activePhase.value = 'victory';
    const victoryTracks = playlists.value.victory || [];
    if (victoryTracks.length === 0) return;

    let targetTrack: SoundtrackTrack | undefined = undefined;

    if (side === 'mafia') {
      targetTrack = victoryTracks.find(
        (t) => t.winner === 'mafia' || t.id.includes('mafia') || t.id.includes('1')
      );
    } else if (side === 'town') {
      targetTrack = victoryTracks.find(
        (t) => t.winner === 'town' || t.id.includes('town') || t.id.includes('2')
      );
    } else if (side === 'third-party' || side === 'thirdparty' || side === 'nostradamus') {
      targetTrack = victoryTracks.find(
        (t) =>
          t.winner === 'third-party' ||
          t.winner === 'nostradamus' ||
          t.id.includes('third') ||
          t.id.includes('3')
      );
    }

    if (!targetTrack) {
      targetTrack = victoryTracks[0];
    }

    if (targetTrack) {
      playTrack(targetTrack, options);
    }
  };

  const pauseMusic = (options: { fade?: boolean } = { fade: true }) => {
    currentPlaybackRequestId++;
    teardownAllOrphans();

    if (!currentAudioEl || !isPlayingMusic.value) {
      isPlayingMusic.value = false;
      return;
    }

    if (options.fade) {
      const el = currentAudioEl;
      const startVol = el.volume;
      fadeAudioElement(el, startVol, 0, 300, () => {
        try {
          el.pause();
        } catch {
          // ignore
        }
        isPlayingMusic.value = false;
      });
    } else {
      try {
        currentAudioEl.pause();
      } catch {
        // ignore
      }
      isPlayingMusic.value = false;
    }
  };

  const resumeMusic = (options: { fade?: boolean } = { fade: true }) => {
    if (isMuted.value) return;
    const targetVol = musicVolume.value * (currentTrack.value?.volumeMultiplier || 1.0);
    const crossfadeMs = (soundtrackConfig.settings.crossfadeDuration || 1.5) * 1000;

    if (currentAudioEl && currentAudioEl.src) {
      if (options.fade) {
        currentAudioEl.volume = 0.001;
      }
      currentAudioEl
        .play()
        .then(() => {
          isPlayingMusic.value = true;
          if (options.fade) {
            fadeAudioElement(currentAudioEl, 0.001, targetVol, crossfadeMs);
          } else if (currentAudioEl) {
            currentAudioEl.volume = targetVol;
          }
        })
        .catch(() => {});
    } else if (currentTrack.value && !currentTrack.value.url?.endsWith('_')) {
      playTrack(currentTrack.value, options);
    } else {
      playPhaseMusic(activePhase.value, options);
    }
  };

  const toggleMusic = () => {
    if (isPlayingMusic.value) {
      pauseMusic({ fade: true });
    } else {
      resumeMusic({ fade: true });
    }
  };

  const stopMusic = (options: { fade?: boolean } = { fade: true }) => {
    currentPlaybackRequestId++;
    teardownAllOrphans();

    if (!currentAudioEl) {
      currentTrack.value = null;
      isPlayingMusic.value = false;
      return;
    }

    const el = currentAudioEl;
    currentAudioEl = null;
    currentTrack.value = null;
    isPlayingMusic.value = false;

    if (options.fade) {
      teardownAudioElement(el, { immediate: false, fadeDurationMs: 400 });
    } else {
      teardownAudioElement(el, { immediate: true });
    }
  };

  const nextTrack = () => {
    const playlistGroup =
      (playlists.value as Record<string, SoundtrackTrack[]>)[activePhase.value] || [];
    const list = playlistGroup.filter((t) => Boolean(t.url) && !t.url.endsWith('_'));
    if (list.length === 0) return;

    const currentIndex = list.findIndex((t) => t.id === currentTrack.value?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextItem = list[nextIndex];
    if (nextItem) {
      playTrack(nextItem);
    }
  };

  const previousTrack = () => {
    const playlistGroup =
      (playlists.value as Record<string, SoundtrackTrack[]>)[activePhase.value] || [];
    const list = playlistGroup.filter((t) => Boolean(t.url) && !t.url.endsWith('_'));
    if (list.length === 0) return;

    const currentIndex = list.findIndex((t) => t.id === currentTrack.value?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    const prevItem = list[prevIndex];
    if (prevItem) {
      playTrack(prevItem);
    }
  };

  // --- SOUND EFFECTS (Web Audio Synthesis) ---

  const playTone = (
    freq: number,
    duration: number = 0.1,
    type: OscillatorType = 'sine',
    gainLevel: number = 0.15
  ) => {
    if (isMuted.value) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before first interaction
    }
  };

  const playTick = () => {
    playTone(800, 0.05, 'triangle', 0.12);
  };

  const playUrgentTick = () => {
    playTone(1200, 0.06, 'triangle', 0.2);
  };

  const playGong = () => {
    if (isMuted.value) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const freqs = [220, 330, 440];
      freqs.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const volume = idx === 0 ? 0.25 : 0.1;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      });
    } catch {
      // Graceful catch
    }
  };

  const playNightFall = () => {
    if (isMuted.value) return;
    const notes = [440, 349.23, 293.66];
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note, 0.6, 'sine', 0.18);
      }, index * 220);
    });
  };

  const playDawnRise = () => {
    if (isMuted.value) return;
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note, 0.5, 'sine', 0.18);
      }, index * 180);
    });
  };

  const playRouletteTick = () => {
    playTone(950, 0.03, 'triangle', 0.08);
  };

  const playFanfare = () => {
    if (isMuted.value) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note, 0.35, 'triangle', 0.18);
      }, index * 120);
    });
  };

  const registerCustomSoundtrack = (
    phase: AudioPhase | string,
    trackUrl: string,
    name: string = 'Custom Theme Stem'
  ) => {
    const pGroup = playlists.value as Record<string, SoundtrackTrack[]>;
    if (!pGroup[phase]) {
      pGroup[phase] = [];
    }
    const customTrack: SoundtrackTrack = {
      id: `custom-${phase}-${Date.now()}`,
      name,
      url: trackUrl,
      phase: phase as AudioPhase,
      volumeMultiplier: 1.0,
      loop: true,
    };
    pGroup[phase].unshift(customTrack);
  };

  const applyUniversalThemeSoundtracks = (themeSoundtracks?: {
    dayStemUrl?: string;
    nightStemUrl?: string;
    votingStemUrl?: string;
    ambientUrl?: string;
  }) => {
    if (!themeSoundtracks) return;
    if (themeSoundtracks.dayStemUrl) {
      registerCustomSoundtrack('day', themeSoundtracks.dayStemUrl, 'Day Theme');
    }
    if (themeSoundtracks.nightStemUrl) {
      registerCustomSoundtrack('night', themeSoundtracks.nightStemUrl, 'Night Theme');
    }
    if (themeSoundtracks.votingStemUrl) {
      registerCustomSoundtrack('voting', themeSoundtracks.votingStemUrl, 'Voting Theme');
    }
    if (themeSoundtracks.ambientUrl) {
      registerCustomSoundtrack('lobby', themeSoundtracks.ambientUrl, 'Lobby Theme');
    }
  };

  const playVoteClick = () => {
    playTone(600, 0.04, 'sine', 0.08);
  };

  return {
    isMuted,
    toggleMute,
    musicVolume,
    setMusicVolume,
    autoPlayOnPhaseChange,
    setAutoPlay,
    currentTrack,
    isPlayingMusic,
    activePhase,
    playlists,
    playTrack,
    playPhaseMusic,
    playVictoryMusic,
    pauseMusic,
    resumeMusic,
    toggleMusic,
    stopMusic,
    nextTrack,
    previousTrack,
    registerCustomSoundtrack,
    applyUniversalThemeSoundtracks,
    // SFX
    playTick,
    playUrgentTick,
    playGong,
    playNightFall,
    playDawnRise,
    playRouletteTick,
    playFanfare,
    playVoteClick,
    resolveAudioUrl,
  };
}

export const useAudioService = useAudio;
