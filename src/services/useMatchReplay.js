import { ref, computed, watch, onUnmounted, getCurrentInstance } from 'vue';

/**
 * Parses and builds a sequential chronological timeline of match states from initial players and game logs.
 *
 * @param {Array} initialPlayers - Array of player objects with initial roles
 * @param {Array} rawGameLogs - Game logs array (from gameStore, sorted newest first)
 * @returns {Array} Array of timeline step snapshots
 */
export function buildTimelineSteps(initialPlayers = [], rawGameLogs = []) {
  const logs = [...(rawGameLogs || [])].reverse(); // oldest first

  // Base state clone
  let currentRoster = (initialPlayers || []).map((p) => ({
    name: p.name,
    role: p.role ? { ...p.role } : null,
    isDead: false,
    deathDay: null,
    deathPhase: null,
    warningCards: 0,
    isSilenced: false,
  }));

  const steps = [];

  // Step 0: Initial Setup
  steps.push({
    index: 0,
    day: 1,
    phase: 'setup',
    type: 'system',
    title: 'Match Initialized',
    detail: 'All players seated and secret roles assigned.',
    timestamp: logs[0]?.timestamp || '',
    activePlayerNames: [],
    actionType: 'setup',
    roster: currentRoster.map((p) => ({ ...p, isHighlighted: false, highlightReason: '' })),
  });

  logs.forEach((log, idx) => {
    const title = log.title || '';
    const detail = log.detail || '';
    const type = log.type || 'system';
    const activeNames = [];
    let actionType = 'event';

    // Track state mutations on roster clone
    currentRoster = currentRoster.map((p) => {
      const updated = { ...p, isHighlighted: false, highlightReason: '' };
      const name = p.name.toLowerCase();
      const titleLower = title.toLowerCase();
      const detailLower = detail.toLowerCase();

      // Check if player is mentioned in this event
      if (
        titleLower.includes(name) ||
        detailLower.includes(name) ||
        (log.player && log.player.toLowerCase() === name) ||
        (log.target && log.target.toLowerCase() === name)
      ) {
        activeNames.push(p.name);
        updated.isHighlighted = true;
      }

      // Check eliminations
      if (
        (detailLower.includes('eliminated') ||
          detailLower.includes('killed') ||
          detailLower.includes('died') ||
          detailLower.includes('executed') ||
          titleLower.includes('eliminated') ||
          titleLower.includes('killed')) &&
        (detailLower.includes(name) || (log.target && log.target.toLowerCase() === name))
      ) {
        if (!detailLower.includes('shield') && !detailLower.includes('saved')) {
          updated.isDead = true;
          updated.deathDay = log.day || 1;
          updated.deathPhase = log.phase || 'day';
          updated.highlightReason = 'eliminated';
          actionType = 'elimination';
        }
      }

      // Check revivals (Constantine)
      if (
        detailLower.includes('revived') &&
        (detailLower.includes(name) || (log.target && log.target.toLowerCase() === name))
      ) {
        updated.isDead = false;
        updated.highlightReason = 'revived';
        actionType = 'revival';
      }

      // Check penalties
      if (
        detailLower.includes('yellow card') &&
        (detailLower.includes(name) || (log.player && log.player.toLowerCase() === name))
      ) {
        updated.warningCards = Math.min(2, (updated.warningCards || 0) + 1);
        updated.highlightReason = 'warning';
        actionType = 'penalty';
      }
      if (
        detailLower.includes('red card') &&
        (detailLower.includes(name) || (log.player && log.player.toLowerCase() === name))
      ) {
        updated.warningCards = 2;
        updated.isDead = true;
        updated.highlightReason = 'disqualified';
        actionType = 'elimination';
      }
      if (
        detailLower.includes('silenced') &&
        (detailLower.includes(name) || (log.player && log.player.toLowerCase() === name))
      ) {
        updated.isSilenced = true;
        updated.highlightReason = 'silenced';
        actionType = 'penalty';
      }

      // Speeches & challenges
      if (type === 'day') {
        if (titleLower.includes('challenge')) {
          actionType = 'challenge';
          if (updated.isHighlighted) updated.highlightReason = 'challenge';
        } else if (titleLower.includes('speaker') || titleLower.includes('turn')) {
          actionType = 'speech';
          if (updated.isHighlighted) updated.highlightReason = 'speaking';
        }
      }

      // Voting
      if (type === 'voting') {
        actionType = 'vote';
        if (updated.isHighlighted) updated.highlightReason = 'voting';
      }

      // Night Actions
      if (type === 'night') {
        actionType = 'night_action';
        if (updated.isHighlighted) updated.highlightReason = 'night_target';
      }

      return updated;
    });

    steps.push({
      index: idx + 1,
      day: log.day || 1,
      phase: log.phase || 'day',
      type: log.type || 'system',
      title: log.title || '',
      detail: log.detail || '',
      timestamp: log.timestamp || '',
      activePlayerNames: [...new Set(activeNames)],
      actionType,
      roster: currentRoster.map((p) => ({ ...p })),
    });
  });

  return steps;
}

/**
 * Match Replay Composable for reactive time-travel scrubber management.
 */
export function useMatchReplay(initialPlayers = [], rawGameLogs = []) {
  const timelineSteps = computed(() => buildTimelineSteps(initialPlayers, rawGameLogs));
  const currentStepIndex = ref(0);
  const isPlaying = ref(false);
  const playbackSpeed = ref(1); // 1x, 2x, 3x

  let timer = null;

  const totalSteps = computed(() => timelineSteps.value.length);
  const currentSnapshot = computed(() => {
    if (!timelineSteps.value.length) return null;
    const idx = Math.max(0, Math.min(currentStepIndex.value, timelineSteps.value.length - 1));
    return timelineSteps.value[idx];
  });

  const goToStep = (idx) => {
    currentStepIndex.value = Math.max(0, Math.min(idx, totalSteps.value - 1));
  };

  const nextStep = () => {
    if (currentStepIndex.value < totalSteps.value - 1) {
      currentStepIndex.value++;
    } else {
      pause();
    }
  };

  const prevStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
    }
  };

  const firstStep = () => {
    currentStepIndex.value = 0;
  };

  const lastStep = () => {
    currentStepIndex.value = Math.max(0, totalSteps.value - 1);
  };

  const play = () => {
    if (currentStepIndex.value >= totalSteps.value - 1) {
      currentStepIndex.value = 0;
    }
    isPlaying.value = true;
    clearInterval(timer);
    timer = setInterval(() => {
      if (currentStepIndex.value < totalSteps.value - 1) {
        currentStepIndex.value++;
      } else {
        pause();
      }
    }, Math.max(400, Math.floor(1600 / playbackSpeed.value)));
  };

  const pause = () => {
    isPlaying.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  };

  const setSpeed = (speed) => {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      play(); // Restart interval with new speed
    }
  };

  watch(playbackSpeed, () => {
    if (isPlaying.value) {
      play();
    }
  });

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });
  }

  return {
    timelineSteps,
    currentStepIndex,
    totalSteps,
    currentSnapshot,
    isPlaying,
    playbackSpeed,
    goToStep,
    nextStep,
    prevStep,
    firstStep,
    lastStep,
    play,
    pause,
    togglePlay,
    setSpeed,
  };
}
