import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loadEncoded, clearGameStorage } from '../utils/storage';
import { mockLastWordCards } from '../data/lastWordCards';
import { evaluateGameStatus } from '../services/useWinCondition';

export const useGameStore = defineStore('game', () => {
  // --- STATE ---
  const gamePhase = ref(loadEncoded('mpga_gamePhase') || 'mode-selection');
  const gameMode = ref(loadEncoded('mpga_gameMode') || null);
  const players = ref(loadEncoded('mpga_gamePlayers') || []);
  const livePlayers = ref(loadEncoded('mpga_livePlayers') || []);
  const subPhase = ref(loadEncoded('mpga_subPhase') || 'day');
  const currentDay = ref(loadEncoded('mpga_currentDay') || 1);
  const gameLogs = ref(loadEncoded('mpga_gameLogs') || []);
  const lastWordDeck = ref(loadEncoded('mpga_lastWordDeck') || [...mockLastWordCards]);
  const drawnLastWordCards = ref(loadEncoded('mpga_drawnLastWordCards') || []);
  const eliminatedPlayer = ref(loadEncoded('mpga_eliminatedPlayer') || null);

  // Win Condition & Game Over State
  const isGameOver = ref(loadEncoded('mpga_isGameOver') || false);
  const winner = ref(loadEncoded('mpga_winner') || null);
  const showGameOverModal = ref(false);
  const nostradamusChoice = ref(loadEncoded('mpga_nostradamusChoice') || null);

  // Active Voting State for Multiplayer Synchronization
  const votingState = ref({
    stage: 'pre-vote', // 'pre-vote', 'defense', 'final-vote'
    qualifiedDefenders: [],
    threshold: 0,
  });

  // Undo History Snapshot Stack
  const undoStack = ref([]);
  const canUndo = computed(() => undoStack.value.length > 0);

  const takeSnapshot = (description = '') => {
    const snapshot = {
      description,
      timestamp: Date.now(),
      gamePhase: gamePhase.value,
      gameMode: gameMode.value ? JSON.parse(JSON.stringify(gameMode.value)) : null,
      players: JSON.parse(JSON.stringify(players.value)),
      livePlayers: JSON.parse(JSON.stringify(livePlayers.value)),
      subPhase: subPhase.value,
      currentDay: currentDay.value,
      gameLogs: JSON.parse(JSON.stringify(gameLogs.value)),
      lastWordDeck: JSON.parse(JSON.stringify(lastWordDeck.value)),
      drawnLastWordCards: JSON.parse(JSON.stringify(drawnLastWordCards.value)),
      eliminatedPlayer: eliminatedPlayer.value
        ? JSON.parse(JSON.stringify(eliminatedPlayer.value))
        : null,
      isGameOver: isGameOver.value,
      winner: winner.value,
      nostradamusChoice: nostradamusChoice.value,
      votingState: JSON.parse(JSON.stringify(votingState.value)),
    };
    undoStack.value.push(snapshot);
    if (undoStack.value.length > 20) {
      undoStack.value.shift();
    }
  };

  const undoLastAction = () => {
    if (!undoStack.value.length) return null;
    const snapshot = undoStack.value.pop();
    if (snapshot) {
      gamePhase.value = snapshot.gamePhase;
      gameMode.value = snapshot.gameMode;
      players.value = snapshot.players;
      livePlayers.value = snapshot.livePlayers;
      subPhase.value = snapshot.subPhase;
      currentDay.value = snapshot.currentDay;
      gameLogs.value = snapshot.gameLogs;
      lastWordDeck.value = snapshot.lastWordDeck;
      drawnLastWordCards.value = snapshot.drawnLastWordCards;
      eliminatedPlayer.value = snapshot.eliminatedPlayer;
      isGameOver.value = snapshot.isGameOver;
      winner.value = snapshot.winner;
      nostradamusChoice.value = snapshot.nostradamusChoice;
      votingState.value = snapshot.votingState;

      addLog('moderator', 'Action Undone', `Rolled back: ${snapshot.description || 'Previous State'}`);
      return snapshot;
    }
    return null;
  };

  const setVotingState = (state) => {
    votingState.value = {
      ...votingState.value,
      ...state,
    };
  };

  // --- ACTIONS ---

  /**
   * Append a structured event to the persistent game log.
   */
  const addLog = (type, title, detail = '', metadata = {}) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      day: currentDay.value,
      phase: subPhase.value,
      type, // 'day', 'voting', 'midday', 'night', 'moderator', 'system'
      title,
      detail,
      ...metadata,
    };
    gameLogs.value.unshift(entry); // newest first
    return entry;
  };

  /**
   * Evaluates if a win condition has been reached.
   */
  const checkWinCondition = () => {
    if (gamePhase.value !== 'playing' || !livePlayers.value.length) {
      return { isGameOver: false, winner: null };
    }

    const result = evaluateGameStatus(livePlayers.value, gameLogs.value, nostradamusChoice.value);
    if (result.isGameOver) {
      isGameOver.value = true;
      winner.value = result.winner;
      showGameOverModal.value = true;
      addLog(
        'system',
        `Victory: ${result.winner.toUpperCase()}`,
        `The match has concluded with victory for ${result.winner.toUpperCase()}!`
      );
    }
    return result;
  };

  const setGameMode = (mode) => {
    gameMode.value = mode;
    gamePhase.value = 'setup';
    addLog('system', 'Game Mode Selected', `Ruleset set to ${mode.nameKey}`);
  };

  const setPlayers = (newPlayers) => {
    players.value = newPlayers;
    gamePhase.value = 'role-selection';
    addLog('system', 'Players Registered', `${newPlayers.length} players added in seated order.`);
  };

  const addSetupPlayer = (name, peerId = null) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = players.value.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return false;
    players.value.push({ name: trimmed, role: null, peerId });
    addLog('system', 'Player Joined Lobby', `${trimmed} joined the lobby.`);
    return true;
  };

  const removeSetupPlayer = (index) => {
    if (index >= 0 && index < players.value.length) {
      const removed = players.value.splice(index, 1)[0];
      if (removed) {
        addLog('system', 'Player Left Lobby', `${removed.name} was removed from the roster.`);
      }
    }
  };

  const reorderSetupPlayers = (fromIndex, toIndex) => {
    if (
      fromIndex >= 0 &&
      fromIndex < players.value.length &&
      toIndex >= 0 &&
      toIndex < players.value.length
    ) {
      const item = players.value.splice(fromIndex, 1)[0];
      players.value.splice(toIndex, 0, item);
    }
  };

  const startPlaying = (playersWithRoles) => {
    players.value = playersWithRoles;
    livePlayers.value = playersWithRoles.map((p) => ({
      ...p,
      isDead: false,
      warnings: 0,
      isSilenced: false,
    }));
    gamePhase.value = 'playing';
    subPhase.value = 'day';
    currentDay.value = 1;
    lastWordDeck.value = [...mockLastWordCards];
    drawnLastWordCards.value = [];
    eliminatedPlayer.value = null;
    isGameOver.value = false;
    winner.value = null;
    showGameOverModal.value = false;
    nostradamusChoice.value = null;

    addLog('system', 'Game Started', `Round 1 begins with ${playersWithRoles.length} players.`);
  };

  /**
   * Updates player death status (alive/dead) and logs the event.
   */
  const setPlayerDeathStatus = (playerName, isDead, reason = '') => {
    const p = livePlayers.value.find((player) => player.name === playerName);
    if (p) {
      takeSnapshot(isDead ? `Eliminate ${playerName}` : `Revive ${playerName}`);
      const prev = p.isDead;
      p.isDead = isDead;

      const actionTitle = isDead
        ? `Player Eliminated: ${playerName}`
        : `Player Revived: ${playerName}`;
      const detailText = reason
        ? `Reason: ${reason} (Role: ${p.role?.name || 'Unknown'})`
        : `Role: ${p.role?.name || 'Unknown'}`;

      addLog('moderator', actionTitle, detailText, {
        player: playerName,
        role: p.role?.name,
        sideId: p.role?.sideId,
        wasDead: prev,
        isDead: isDead,
      });

      // Check win condition whenever player status changes
      checkWinCondition();
    }
  };

  /**
   * Issues warnings/penalties or toggles silence for a player.
   */
  const applyPenalty = (playerName, { warningDelta = 0, isSilenced = null } = {}, reason = '') => {
    const p = livePlayers.value.find((player) => player.name === playerName);
    if (!p) return;

    takeSnapshot(`Penalty on ${playerName}`);

    if (warningDelta !== 0) {
      p.warnings = Math.max(0, (p.warnings || 0) + warningDelta);
      addLog(
        'moderator',
        `Penalty Warning: ${playerName}`,
        `Warnings: ${p.warnings} (${warningDelta > 0 ? '+1' : '-1'}). ${reason ? 'Reason: ' + reason : ''}`,
        { player: playerName, warnings: p.warnings }
      );
    }

    if (isSilenced !== null) {
      p.isSilenced = isSilenced;
      addLog(
        'moderator',
        `Silence Status: ${playerName}`,
        `Silenced: ${isSilenced ? 'YES' : 'NO'}. ${reason ? 'Reason: ' + reason : ''}`,
        { player: playerName, isSilenced }
      );
    }
  };

  const setEliminatedPlayer = (player) => {
    eliminatedPlayer.value = player;
  };

  const setNostradamusChoice = (sideId) => {
    takeSnapshot('Nostradamus Alignment Choice');
    nostradamusChoice.value = sideId;
    addLog(
      'night',
      'Nostradamus Side Chosen',
      `Nostradamus secretly aligned with ${sideId.toUpperCase()}`
    );
  };

  /**
   * Draws a Last Word Card from the remaining deck, logs it, and retires it.
   */
  const drawLastWordCard = (playerName) => {
    if (!lastWordDeck.value.length) return null;

    takeSnapshot(`Draw Last Word Card for ${playerName}`);

    const randomIndex = Math.floor(Math.random() * lastWordDeck.value.length);
    const drawnCard = lastWordDeck.value.splice(randomIndex, 1)[0];

    const record = {
      card: drawnCard,
      playerName,
      day: currentDay.value,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    drawnLastWordCards.value.push(record);

    addLog(
      'midday',
      `Last Word Card Drawn: ${playerName}`,
      `Card: ${drawnCard.nameKey} (Remaining in deck: ${lastWordDeck.value.length})`,
      { player: playerName, cardId: drawnCard.id }
    );

    return drawnCard;
  };

  const proceedToNextDay = () => {
    takeSnapshot(`Advance to Day ${currentDay.value + 1}`);
    currentDay.value++;
    subPhase.value = 'day';
    eliminatedPlayer.value = null;

    // Reset temporary day statuses like daily silence
    livePlayers.value.forEach((p) => {
      p.isSilenced = false;
    });

    addLog('day', `Day ${currentDay.value} Begun`, `Dawn breaks for Day ${currentDay.value}.`);

    // Check win condition after night resolution
    checkWinCondition();
  };

  const setSubPhase = (phase) => {
    takeSnapshot(`Transition to ${phase}`);
    subPhase.value = phase;
    addLog(phase, `Phase Transition -> ${phase.toUpperCase()}`, `Entering ${phase} phase.`);
  };

  const dismissGameOverModal = () => {
    showGameOverModal.value = false;
  };

  const reopenGameOverModal = () => {
    showGameOverModal.value = true;
  };

  const resetGame = () => {
    clearGameStorage();
    gamePhase.value = 'mode-selection';
    gameMode.value = null;
    players.value = [];
    livePlayers.value = [];
    subPhase.value = 'day';
    currentDay.value = 1;
    gameLogs.value = [];
    lastWordDeck.value = [...mockLastWordCards];
    drawnLastWordCards.value = [];
    eliminatedPlayer.value = null;
    isGameOver.value = false;
    winner.value = null;
    showGameOverModal.value = false;
    nostradamusChoice.value = null;
    undoStack.value = [];
  };

  return {
    // State
    gamePhase,
    gameMode,
    players,
    livePlayers,
    subPhase,
    currentDay,
    gameLogs,
    lastWordDeck,
    drawnLastWordCards,
    eliminatedPlayer,
    isGameOver,
    winner,
    showGameOverModal,
    nostradamusChoice,
    votingState,
    undoStack,
    canUndo,
    // Actions
    addLog,
    checkWinCondition,
    setGameMode,
    setPlayers,
    addSetupPlayer,
    removeSetupPlayer,
    reorderSetupPlayers,
    startPlaying,
    setPlayerDeathStatus,
    applyPenalty,
    setEliminatedPlayer,
    setNostradamusChoice,
    drawLastWordCard,
    proceedToNextDay,
    setSubPhase,
    setVotingState,
    takeSnapshot,
    undoLastAction,
    dismissGameOverModal,
    reopenGameOverModal,
    resetGame,
  };
});
