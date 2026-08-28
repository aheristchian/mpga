import { ref } from 'vue';

const isMuted = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_audio_muted') === 'true' : false
);
let audioCtx = null;

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
  };

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

  /** Normal countdown tick (for last 10 seconds) */
  const playTick = () => {
    playTone(800, 0.05, 'triangle', 0.12);
  };

  /** Urgent fast tick (for last 3 seconds) */
  const playUrgentTick = () => {
    playTone(1200, 0.06, 'triangle', 0.2);
  };

  /** Deep resonant gong when time is up (0s) */
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

  /** Ethereal descending chords for Night Phase sleep call */
  const playNightFall = () => {
    if (isMuted.value) return;
    const notes = [440, 349.23, 293.66]; // A4 -> F4 -> D4 (D minor)
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note, 0.6, 'sine', 0.18);
      }, index * 220);
    });
  };

  /** Bright ascending chords for Morning wake-up call */
  const playDawnRise = () => {
    if (isMuted.value) return;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4 -> E4 -> G4 -> C5 (C major)
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note, 0.5, 'sine', 0.18);
      }, index * 180);
    });
  };

  /** Mechanical click for roulette wheel rotations */
  const playRouletteTick = () => {
    playTone(950, 0.03, 'triangle', 0.08);
  };

  /** Fanfare for card reveal or victory */
  const playFanfare = () => {
    if (isMuted.value) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    notes.forEach((note, index) => {
      setTimeout(() => {
        playTone(note, 0.35, 'triangle', 0.18);
      }, index * 120);
    });
  };

  /** Subtle UI click for vote button presses */
  const playVoteClick = () => {
    playTone(600, 0.04, 'sine', 0.08);
  };

  return {
    isMuted,
    toggleMute,
    playTick,
    playUrgentTick,
    playGong,
    playNightFall,
    playDawnRise,
    playRouletteTick,
    playFanfare,
    playVoteClick,
  };
}
