import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loadEncoded, saveEncoded, clearGameStorage, saveRecentPlayer } from '../utils/storage';
import { mockLastWordCards } from '../data/lastWordCards';
import { evaluateGameStatus } from '../services/useWinCondition';
import { MODE_TO_UNIVERSAL_PACK_MAP } from '../data/presets';
import type {
  GamePhase,
  GameMode,
  Player,
  SubPhase,
  GameLog,
  LastWordCard,
  DrawnCardRecord,
  VotingState,
  GameStateSnapshot,
  WinResult,
  UniversalGamePack,
  FactionDefinition,
} from '../types';

export const useGameStore = defineStore('game', () => {
  // --- STATE ---
  const gamePhase = ref<GamePhase>(loadEncoded<GamePhase>('mpga_gamePhase') || 'mode-selection');
  const gameMode = ref<GameMode | null>(loadEncoded<GameMode>('mpga_gameMode') || null);
  const players = ref<Player[]>(loadEncoded<Player[]>('mpga_gamePlayers') || []);
  const livePlayers = ref<Player[]>(loadEncoded<Player[]>('mpga_livePlayers') || []);
  const subPhase = ref<SubPhase>(loadEncoded<SubPhase>('mpga_subPhase') || 'day');
  const currentDay = ref<number>(loadEncoded<number>('mpga_currentDay') || 1);
  const gameLogs = ref<GameLog[]>(loadEncoded<GameLog[]>('mpga_gameLogs') || []);
  const lastWordDeck = ref<LastWordCard[]>(
    loadEncoded<LastWordCard[]>('mpga_lastWordDeck') || [...mockLastWordCards]
  );
  const drawnLastWordCards = ref<DrawnCardRecord[]>(
    loadEncoded<DrawnCardRecord[]>('mpga_drawnLastWordCards') || []
  );
  const eliminatedPlayer = ref<Player | null>(loadEncoded<Player>('mpga_eliminatedPlayer') || null);

  // Win Condition & Game Over State
  const isGameOver = ref<boolean>(loadEncoded<boolean>('mpga_isGameOver') || false);
  const winner = ref<string | null>(loadEncoded<string>('mpga_winner') || null);
  const winningFaction = ref<FactionDefinition | null>(
    loadEncoded<FactionDefinition>('mpga_winningFaction') || null
  );
  const showGameOverModal = ref<boolean>(false);
  const nostradamusChoice = ref<string | null>(
    loadEncoded<string>('mpga_nostradamusChoice') || null
  );
  const activeUniversalPack = ref<UniversalGamePack | null>(
    loadEncoded<UniversalGamePack>('mpga_activeUniversalPack') || null
  );

  // Active Voting State for Multiplayer Synchronization
  const votingState = ref<VotingState>({
    stage: 'pre-vote', // 'pre-vote', 'defense', 'final-vote'
    qualifiedDefenders: [],
    threshold: 0,
  });

  // Role Action Usage Tracking
  const doctorSelfHealsUsed = ref<number>(loadEncoded<number>('mpga_doctorSelfHealsUsed') || 0);
  const constantineRevivesUsed = ref<number>(
    loadEncoded<number>('mpga_constantineRevivesUsed') || 0
  );

  // Silenced Players Tracking (for Silencer ability)
  const silencedPlayers = ref<string[]>(loadEncoded<string[]>('mpga_silencedPlayers') || []);

  const setSilencedPlayers = (names: string[]) => {
    silencedPlayers.value = names;
    saveEncoded('mpga_silencedPlayers', names);
    livePlayers.value.forEach((p) => {
      p.isSilenced = names.includes(p.name);
    });
  };

  const clearSilencedPlayers = () => {
    silencedPlayers.value = [];
    saveEncoded('mpga_silencedPlayers', []);
    livePlayers.value.forEach((p) => {
      p.isSilenced = false;
    });
  };

  // Active Speaker & Speech Timer Tracking (for Projector TV and Multiplayer sync)
  const activeSpeaker = ref<string | null>(null);
  const speakerTimeRemaining = ref<number>(0);
  const isChallengeActive = ref<boolean>(false);

  const setActiveSpeaker = (
    speaker: string | null,
    timeRemaining: number = 0,
    challenge: boolean = false
  ) => {
    activeSpeaker.value = speaker;
    speakerTimeRemaining.value = timeRemaining;
    isChallengeActive.value = challenge;
  };

  const updateSpeakerTimer = (timeRemaining: number) => {
    speakerTimeRemaining.value = timeRemaining;
  };

  // Undo History Snapshot Stack
  const undoStack = ref<GameStateSnapshot[]>([]);
  const canUndo = computed(() => undoStack.value.length > 0);

  const takeSnapshot = (description: string = '') => {
    const snapshot: GameStateSnapshot = {
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
      silencedPlayers: JSON.parse(JSON.stringify(silencedPlayers.value)),
    };
    undoStack.value.push(snapshot);
    if (undoStack.value.length > 20) {
      undoStack.value.shift();
    }
  };

  const undoLastAction = (): GameStateSnapshot | null => {
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
      if (snapshot.silencedPlayers) {
        silencedPlayers.value = snapshot.silencedPlayers;
        livePlayers.value.forEach((p) => {
          p.isSilenced = silencedPlayers.value.includes(p.name);
        });
      }

      addLog(
        'moderator',
        'Action Undone',
        `Rolled back: ${snapshot.description || 'Previous State'}`
      );
      return snapshot;
    }
    return null;
  };

  const setVotingState = (state: Partial<VotingState>) => {
    votingState.value = {
      ...votingState.value,
      ...state,
    };
  };

  // --- ACTIONS ---

  /**
   * Append a structured event to the persistent game log.
   */
  const addLog = (
    type: string,
    title: string,
    detail: string = '',
    metadata: Record<string, any> = {}
  ): GameLog => {
    const entry: GameLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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
  const checkWinCondition = (): WinResult => {
    if (gamePhase.value !== 'playing' || !livePlayers.value.length) {
      return { isGameOver: false, winner: null };
    }

    const result = evaluateGameStatus(
      livePlayers.value,
      gameLogs.value,
      nostradamusChoice.value,
      activeUniversalPack.value?.factions
    );
    if (result.isGameOver) {
      isGameOver.value = true;
      winner.value = result.winner;
      winningFaction.value = result.winningFaction || null;
      saveEncoded('mpga_isGameOver', isGameOver.value);
      saveEncoded('mpga_winner', winner.value);
      saveEncoded('mpga_winningFaction', winningFaction.value);
      showGameOverModal.value = true;
      const winTitle =
        result.winningFaction?.name || (result.winner ? result.winner.toUpperCase() : 'UNKNOWN');
      addLog(
        'system',
        `Victory: ${winTitle}`,
        `The match has concluded with victory for ${winTitle}!`
      );
    }
    return result;
  };

  const setGameMode = (mode: GameMode) => {
    gameMode.value = mode;
    gamePhase.value = 'setup';
    if (MODE_TO_UNIVERSAL_PACK_MAP[mode.id]) {
      setActiveUniversalPack(MODE_TO_UNIVERSAL_PACK_MAP[mode.id]);
    }
    addLog('system', 'Game Mode Selected', `Ruleset set to ${mode.nameKey}`);
  };

  const setPlayers = (newPlayers: Player[]) => {
    players.value = newPlayers;
    gamePhase.value = 'role-selection';
    newPlayers.forEach((p) => saveRecentPlayer(p.name));
    addLog('system', 'Players Registered', `${newPlayers.length} players added in seated order.`);
  };

  const addSetupPlayer = (name: string, peerId: string | null = null): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = players.value.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return false;
    players.value.push({ name: trimmed, role: null, peerId });
    saveRecentPlayer(trimmed);
    addLog('system', 'Player Joined Lobby', `${trimmed} joined the lobby.`);
    return true;
  };

  const removeSetupPlayer = (index: number) => {
    if (index >= 0 && index < players.value.length) {
      const removed = players.value.splice(index, 1)[0];
      if (removed) {
        addLog('system', 'Player Left Lobby', `${removed.name} was removed from the roster.`);
      }
    }
  };

  const reorderSetupPlayers = (fromIndex: number, toIndex: number) => {
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

  const setActiveUniversalPack = (pack: UniversalGamePack | null) => {
    activeUniversalPack.value = pack;
    saveEncoded('mpga_activeUniversalPack', pack);
  };

  const updatePlayerCharges = (
    playerName: string,
    charges: Record<string, number | 'unlimited'>
  ) => {
    const p = livePlayers.value.find((pl) => pl.name === playerName);
    if (p) {
      p.abilityCharges = { ...(p.abilityCharges || {}), ...charges };
    }
    const baseP = players.value.find((pl) => pl.name === playerName);
    if (baseP) {
      baseP.abilityCharges = { ...(baseP.abilityCharges || {}), ...charges };
    }
  };

  const applyPlayerCharges = (
    updatedCharges: Record<string, Record<string, number | 'unlimited'>>
  ) => {
    Object.entries(updatedCharges).forEach(([pName, charges]) => {
      updatePlayerCharges(pName, charges);
    });
  };

  const startPlaying = (playersWithRoles: Player[]) => {
    players.value = playersWithRoles;
    playersWithRoles.forEach((p) => saveRecentPlayer(p.name));

    const universalPack = activeUniversalPack.value;
    const initialDeck =
      universalPack?.pipeline?.enableExitCards === false
        ? []
        : universalPack?.exitCards && universalPack.exitCards.length > 0
          ? [...universalPack.exitCards]
          : [...mockLastWordCards];

    livePlayers.value = playersWithRoles.map((p) => {
      const initialCharges: Record<string, number | 'unlimited'> = {};
      if (p.role?.passiveAbilityIds?.includes('shield')) {
        initialCharges['shield'] = 1;
      }
      return {
        ...p,
        isDead: false,
        warnings: 0,
        isSilenced: false,
        abilityCharges: { ...initialCharges, ...(p.abilityCharges || {}) },
      };
    });
    gamePhase.value = 'playing';
    subPhase.value = 'day';
    currentDay.value = 1;
    lastWordDeck.value = initialDeck;
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
  const setPlayerDeathStatus = (playerName: string, isDead: boolean, reason: string = '') => {
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
  const applyPenalty = (
    playerName: string,
    { warningDelta = 0, isSilenced = null as boolean | null } = {},
    reason: string = ''
  ) => {
    const p = livePlayers.value.find((player) => player.name === playerName);
    if (!p) return;

    takeSnapshot(`Penalty on ${playerName}`);
    const maxWarnings = activeUniversalPack.value?.pipeline?.penaltyWarningLimit ?? 2;

    if (warningDelta !== 0) {
      p.warnings = Math.max(0, (p.warnings || 0) + warningDelta);
      const isDisqualified = p.warnings >= maxWarnings;
      addLog(
        'moderator',
        `Penalty Warning: ${playerName}`,
        `Warnings: ${p.warnings}/${maxWarnings} (${warningDelta > 0 ? '+1' : '-1'}). ${isDisqualified ? 'MAX PENALTY REACHED.' : ''} ${reason ? 'Reason: ' + reason : ''}`,
        { player: playerName, warnings: p.warnings, isDisqualified }
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

  const setEliminatedPlayer = (player: Player | null) => {
    eliminatedPlayer.value = player;
  };

  const breakPlayerShield = (playerName: string) => {
    const p = livePlayers.value.find((player) => player.name === playerName);
    if (!p) return;
    p.isShieldBroken = true;
    if (p.role?.passiveAbilityIds) {
      p.role.passiveAbilityIds = p.role.passiveAbilityIds.filter((id) => id !== 'shield');
    }
    addLog(
      'night',
      `Shield Broken: ${playerName}`,
      `${playerName}'s bulletproof shield has shattered and will no longer protect them.`
    );
  };

  const convertPlayerSide = (playerName: string, newSideId: string, reason: string) => {
    const p = livePlayers.value.find((player) => player.name === playerName);
    if (!p || !p.role) return;
    takeSnapshot(`Convert side for ${playerName}`);
    p.role.sideId = newSideId;
    addLog(
      'night',
      `Allegiance Changed: ${playerName}`,
      `${playerName} has joined the ${newSideId.toUpperCase()} family. Reason: ${reason}`
    );
    checkWinCondition();
  };

  const recordDoctorSelfHeal = () => {
    doctorSelfHealsUsed.value++;
  };

  const recordConstantineRevive = () => {
    constantineRevivesUsed.value++;
  };

  const setNostradamusChoice = (sideId: string) => {
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
  const drawLastWordCard = (playerName: string): LastWordCard | null => {
    if (!lastWordDeck.value.length) return null;

    takeSnapshot(`Draw Last Word Card for ${playerName}`);

    const randomIndex = Math.floor(Math.random() * lastWordDeck.value.length);
    const drawnCard = lastWordDeck.value.splice(randomIndex, 1)[0];

    const record: DrawnCardRecord = {
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
    clearSilencedPlayers();

    addLog('day', `Day ${currentDay.value} Begun`, `Dawn breaks for Day ${currentDay.value}.`);

    // Check win condition after night resolution
    checkWinCondition();
  };

  const setSubPhase = (phase: SubPhase) => {
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
    doctorSelfHealsUsed.value = 0;
    constantineRevivesUsed.value = 0;
    clearSilencedPlayers();
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
    winningFaction,
    activeUniversalPack,
    showGameOverModal,
    nostradamusChoice,
    votingState,
    doctorSelfHealsUsed,
    constantineRevivesUsed,
    silencedPlayers,
    undoStack,
    canUndo,
    activeSpeaker,
    speakerTimeRemaining,
    isChallengeActive,
    // Actions
    addLog,
    checkWinCondition,
    setGameMode,
    setActiveUniversalPack,
    updatePlayerCharges,
    applyPlayerCharges,
    setPlayers,
    addSetupPlayer,
    removeSetupPlayer,
    reorderSetupPlayers,
    startPlaying,
    setPlayerDeathStatus,
    applyPenalty,
    setEliminatedPlayer,
    breakPlayerShield,
    convertPlayerSide,
    recordDoctorSelfHeal,
    recordConstantineRevive,
    setSilencedPlayers,
    clearSilencedPlayers,
    setActiveSpeaker,
    updateSpeakerTimer,
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
