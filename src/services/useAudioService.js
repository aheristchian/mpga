import { ref, computed } from 'vue';
import { soundtrackConfig, resolveAudioUrl, resolveSunoAudioUrl } from '../data/soundtracks';

// Persisted audio states
const isMuted = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_audio_muted') === 'true' : false
);

const musicVolume = ref(
  typeof localStorage !== 'undefined' && localStorage.getItem('mpga_music_volume') !== null
    ? parseFloat(localStorage.getItem('mpga_music_volume'))
    : soundtrackConfig.settings.defaultVolume
);

const autoPlayOnPhaseChange = ref(
  typeof localStorage !== 'undefined' && localStorage.getItem('mpga_music_autoplay') !== null
    ? localStorage.getItem('mpga_music_autoplay') === 'true'
    : soundtrackConfig.settings.autoPlayOnPhaseChange
);

// Current Track & Playback Status
const currentTrack = ref(null);
const isPlayingMusic = ref(false);
const activePhase = ref('lobby');
const playlists = ref(JSON.parse(JSON.stringify(soundtrackConfig.playlists)));

// Audio Elements & Web Audio Context
let audioCtx = null;
let currentAudioEl = null;
let fadeInterval = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
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
    if (isMuted.value && currentAudioEl) {
      currentAudioEl.pause();
      isPlayingMusic.value = false;
    } else if (!isMuted.value && currentTrack.value && !isPlayingMusic.value) {
      resumeMusic();
    }
  };

  const setMusicVolume = (vol) => {
    const clamped = Math.max(0, Math.min(1, parseFloat(vol) || 0));
    musicVolume.value = clamped;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_music_volume', String(clamped));
    }
    if (currentAudioEl && !isMuted.value) {
      const multiplier = currentTrack.value?.volumeMultiplier || 1.0;
      currentAudioEl.volume = clamped * multiplier;
    }
  };

  const setAutoPlay = (enabled) => {
    autoPlayOnPhaseChange.value = Boolean(enabled);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_music_autoplay', String(autoPlayOnPhaseChange.value));
    }
  };

  /**
   * Internal stream player with smooth crossfade
   */
  const playStream = (streamUrl, track, options = { fade: true }) => {
    if (!streamUrl || isMuted.value) return;

    if (currentTrack.value?.id === track.id && isPlayingMusic.value && currentAudioEl && !currentAudioEl.paused) {
      return;
    }

    if (typeof window === 'undefined' || typeof window.Audio === 'undefined') {
      currentTrack.value = track;
      isPlayingMusic.value = true;
      return;
    }

    try {
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }

      // Stop previous audio if playing
      if (currentAudioEl) {
        currentAudioEl.pause();
        currentAudioEl.src = '';
        currentAudioEl = null;
      }

      const audio = new Audio(streamUrl);
      audio.loop = false;

      const targetVol = musicVolume.value * (track.volumeMultiplier || 1.0);
      audio.volume = options.fade ? 0.01 : targetVol;

      audio.addEventListener('ended', () => {
        nextTrack();
      });

      audio.addEventListener('error', (err) => {
        console.warn(`[MPGA Audio] Error playing track "${track.title}" (${streamUrl}):`, err);
        isPlayingMusic.value = false;
      });

      audio.play().then(() => {
        currentTrack.value = track;
        isPlayingMusic.value = true;

        if (options.fade) {
          let step = 0;
          const steps = 15;
          const stepTime = (soundtrackConfig.settings.crossfadeDuration * 1000) / steps;
          fadeInterval = setInterval(() => {
            step++;
            if (audio) {
              audio.volume = Math.min(targetVol, (targetVol * step) / steps);
            }
            if (step >= steps) {
              clearInterval(fadeInterval);
              fadeInterval = null;
            }
          }, stepTime);
        }
      }).catch((e) => {
        console.warn('[MPGA Audio] Playback prevented by browser autoplay policy:', e);
        isPlayingMusic.value = false;
      });

      currentAudioEl = audio;
    } catch (e) {
      console.warn('[MPGA Audio] Audio instantiation failed:', e);
    }
  };

  /**
   * Plays a specific track object with smart URL resolution
   * @param {Object} track - { id, title, artist, url, volumeMultiplier }
   * @param {Object} options - { fade: boolean }
   */
  const playTrack = (track, options = { fade: true }) => {
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
  const playPhaseMusic = (phaseKey, options = { fade: true, random: true }) => {
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

    const phasePlaylist = (playlists.value[phaseKey] || []).filter(
      (t) => Boolean(t.url) && !t.url.endsWith('_')
    );
    if (phasePlaylist.length === 0) return;

    let playableTrack;
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
  const playVictoryMusic = (winnerSide = 'town', options = { fade: true }) => {
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

    let targetTrack = null;

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

  const pauseMusic = () => {
    if (currentAudioEl) {
      currentAudioEl.pause();
    }
    isPlayingMusic.value = false;
  };

  const resumeMusic = () => {
    if (isMuted.value) return;
    if (currentAudioEl && currentAudioEl.src) {
      currentAudioEl.play().then(() => {
        isPlayingMusic.value = true;
      }).catch(() => {});
    } else if (currentTrack.value && !currentTrack.value.url?.endsWith('_')) {
      playTrack(currentTrack.value);
    } else {
      playPhaseMusic(activePhase.value);
    }
  };

  const toggleMusic = () => {
    if (isPlayingMusic.value) {
      pauseMusic();
    } else {
      resumeMusic();
    }
  };

  const stopMusic = () => {
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.src = '';
      currentAudioEl = null;
    }
    currentTrack.value = null;
    isPlayingMusic.value = false;
  };

  const nextTrack = () => {
    const list = (playlists.value[activePhase.value] || []).filter(
      (t) => Boolean(t.url) && !t.url.endsWith('_')
    );
    if (list.length === 0) return;

    const currentIndex = list.findIndex((t) => t.id === currentTrack.value?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextItem = list[nextIndex];
    if (nextItem) {
      playTrack(nextItem);
    }
  };

  const previousTrack = () => {
    const list = (playlists.value[activePhase.value] || []).filter(
      (t) => Boolean(t.url) && !t.url.endsWith('_')
    );
    if (list.length === 0) return;

    const currentIndex = list.findIndex((t) => t.id === currentTrack.value?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    const prevItem = list[prevIndex];
    if (prevItem) {
      playTrack(prevItem);
    }
  };

  // --- SOUND EFFECTS (Web Audio Synthesis) ---

  const playTone = (freq, duration = 0.1, type = 'sine', gainLevel = 0.15) => {
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
    resolveSunoAudioUrl,
  };
}
