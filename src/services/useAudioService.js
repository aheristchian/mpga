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

const preferLocal = ref(
  typeof localStorage !== 'undefined' && localStorage.getItem('mpga_audio_prefer_local') !== null
    ? localStorage.getItem('mpga_audio_prefer_local') === 'true'
    : (soundtrackConfig.settings.preferLocal ?? true)
);

const remoteBaseUrl = ref(
  typeof localStorage !== 'undefined' && localStorage.getItem('mpga_audio_remote_base_url') !== null
    ? localStorage.getItem('mpga_audio_remote_base_url')
    : (soundtrackConfig.settings.remoteBaseUrl || '')
);

// Current Track & Playback Status
const currentTrack = ref(null);
const isPlayingMusic = ref(false);
const activePhase = ref('night');
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

  const setPreferLocal = (val) => {
    preferLocal.value = Boolean(val);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_audio_prefer_local', String(preferLocal.value));
    }
  };

  const setRemoteBaseUrl = (url) => {
    remoteBaseUrl.value = String(url || '').trim();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_audio_remote_base_url', remoteBaseUrl.value);
    }
  };

  /**
   * Internal stream player with smooth crossfade and error fallback handling
   */
  const playStream = (streamUrl, fallbackUrl, track, options = { fade: true }) => {
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
      audio.crossOrigin = 'anonymous';
      audio.loop = false;

      const targetVol = musicVolume.value * (track.volumeMultiplier || 1.0);
      audio.volume = options.fade ? 0.01 : targetVol;

      audio.addEventListener('ended', () => {
        nextTrack();
      });

      audio.addEventListener('error', (err) => {
        if (fallbackUrl && fallbackUrl !== streamUrl) {
          console.info(
            `[MPGA Audio] Primary audio stream failed for "${track.title}" (${streamUrl}). Falling back to online/alternative URL: ${fallbackUrl}`
          );
          playStream(fallbackUrl, null, track, options);
          return;
        }
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
        if (fallbackUrl && fallbackUrl !== streamUrl) {
          console.info(
            `[MPGA Audio] Autoplay or playback rejected for "${streamUrl}", attempting fallback: ${fallbackUrl}`
          );
          playStream(fallbackUrl, null, track, options);
          return;
        }
        console.warn('[MPGA Audio] Playback prevented by browser autoplay policy:', e);
        isPlayingMusic.value = false;
      });

      currentAudioEl = audio;
    } catch (e) {
      if (fallbackUrl && fallbackUrl !== streamUrl) {
        playStream(fallbackUrl, null, track, options);
        return;
      }
      console.warn('[MPGA Audio] Audio instantiation failed:', e);
    }
  };

  /**
   * Plays a specific track object with smart local-first / online fallback resolution
   * @param {Object} track - { id, title, artist, localUrl, onlineUrl, url, volumeMultiplier }
   * @param {Object} options - { fade: boolean }
   */
  const playTrack = (track, options = { fade: true }) => {
    if (!track || isMuted.value) return;

    const rawLocal = track.localUrl || track.url || '';
    const rawOnline = track.onlineUrl || '';

    // Ignore disabled tracks (ending with underscore to prevent unwanted traffic)
    if (rawLocal && rawLocal.endsWith('_') && (!rawOnline || rawOnline.endsWith('_'))) return;

    const primaryRaw = preferLocal.value ? (rawLocal || rawOnline) : (rawOnline || rawLocal);
    const fallbackRaw = preferLocal.value
      ? (rawOnline && rawOnline !== primaryRaw ? rawOnline : null)
      : (rawLocal && rawLocal !== primaryRaw ? rawLocal : null);

    const primaryUrl = resolveAudioUrl(primaryRaw, remoteBaseUrl.value);
    const fallbackUrl = fallbackRaw ? resolveAudioUrl(fallbackRaw, remoteBaseUrl.value) : null;

    if (!primaryUrl && !fallbackUrl) return;

    playStream(primaryUrl || fallbackUrl, fallbackUrl && primaryUrl ? fallbackUrl : null, track, options);
  };

  /**
   * Plays music for a given phase (e.g. 'night', 'day', 'voting', 'midday', 'victory', 'lobby')
   */
  const playPhaseMusic = (phaseKey, options = { fade: true }) => {
    if (!phaseKey) return;
    activePhase.value = phaseKey;

    const phasePlaylist = playlists.value[phaseKey] || [];
    if (phasePlaylist.length === 0) return;

    // Pick first track with a valid, non-disabled URL
    const playableTrack = phasePlaylist.find((t) => Boolean(t.url) && !t.url.endsWith('_'));
    if (playableTrack) {
      playTrack(playableTrack, options);
    }
  };

  /**
   * Plays winner-specific victory theme (Mafia -> Win 1, Town -> Win 2, 3rd Party -> Win 3)
   */
  const playVictoryMusic = (winnerSide = 'town', options = { fade: true }) => {
    activePhase.value = 'victory';
    const victoryTracks = playlists.value.victory || [];
    if (victoryTracks.length === 0) return;

    let targetTrack = null;
    const side = String(winnerSide || 'town').toLowerCase();

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
    const list = (playlists.value[activePhase.value] || []).filter((t) => Boolean(t.url) && !t.url.endsWith('_'));
    if (list.length === 0) return;

    const currentIndex = list.findIndex((t) => t.id === currentTrack.value?.id);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextItem = list[nextIndex];
    if (nextItem && nextItem.url) {
      playTrack(nextItem);
    }
  };

  const previousTrack = () => {
    const list = playlists.value[activePhase.value] || [];
    if (list.length === 0) return;

    const currentIndex = list.findIndex((t) => t.id === currentTrack.value?.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    const prevItem = list[prevIndex];
    if (prevItem && prevItem.url) {
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
    preferLocal,
    setPreferLocal,
    remoteBaseUrl,
    setRemoteBaseUrl,
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
