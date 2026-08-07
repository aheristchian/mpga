import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loadEncoded, clearGameStorage } from '../utils/storage';

export const useGameStore = defineStore('game', () => {
  // --- STATE ---
  const gamePhase = ref(loadEncoded('mpga_gamePhase') || 'mode-selection');
  const gameMode = ref(loadEncoded('mpga_gameMode') || null);
  const players = ref(loadEncoded('mpga_gamePlayers') || []);
  const livePlayers = ref(loadEncoded('mpga_livePlayers') || []);
  const subPhase = ref(loadEncoded('mpga_subPhase') || 'day');
  const currentDay = ref(loadEncoded('mpga_currentDay') || 1);

  // --- ACTIONS ---

  const setGameMode = (mode) => {
    gameMode.value = mode;
    gamePhase.value = 'setup';
  };

  const setPlayers = (newPlayers) => {
    players.value = newPlayers;
    gamePhase.value = 'role-selection';
  };

  const startPlaying = (playersWithRoles) => {
    players.value = playersWithRoles;
    livePlayers.value = playersWithRoles.map((p) => ({ ...p, isDead: false }));
    gamePhase.value = 'playing';
    subPhase.value = 'day';
    currentDay.value = 1;
  };

  const setPlayerDeathStatus = (playerName, isDead) => {
    const p = livePlayers.value.find((p) => p.name === playerName);
    if (p) p.isDead = isDead;
  };

  const proceedToNextDay = () => {
    currentDay.value++;
    subPhase.value = 'day';
  };

  const setSubPhase = (phase) => {
    subPhase.value = phase;
  };

  const resetGame = () => {
    clearGameStorage();
    gamePhase.value = 'mode-selection';
    gameMode.value = null;
    players.value = [];
    livePlayers.value = [];
    subPhase.value = 'day';
    currentDay.value = 1;
  };

  return {
    // State
    gamePhase,
    gameMode,
    players,
    livePlayers,
    subPhase,
    currentDay,
    // Actions
    setGameMode,
    setPlayers,
    startPlaying,
    setPlayerDeathStatus,
    proceedToNextDay,
    setSubPhase,
    resetGame,
  };
});
