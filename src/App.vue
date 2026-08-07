<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans p-6">
    <header class="mb-10 relative flex flex-col items-center">
      <h1
        class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 drop-shadow-md tracking-wider text-center"
      >
        {{ $t('app.title') }}
      </h1>
      <p class="text-gray-400 mt-2 text-center">{{ $t('app.subtitle') }}</p>

      <!-- GLOBAL START OVER BUTTON -->
      <button
        v-if="store.gamePhase !== 'mode-selection'"
        class="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white rounded transition-colors text-sm font-semibold flex items-center gap-2"
        @click="showResetModal = true"
      >
        <span>↺</span> {{ $t('app.startOver') }}
      </button>
    </header>

    <main class="container mx-auto pb-20">
      <!-- MODE SELECTION PHASE -->
      <ModeSelection
        v-if="store.gamePhase === 'mode-selection'"
        @mode-selected="handleModeSelected"
      />

      <!-- SETUP PHASE -->
      <PlayerEntry
        v-else-if="store.gamePhase === 'setup'"
        :min-players="store.gameMode?.minPlayers || 4"
        @players-ready="handlePlayersReady"
      />

      <!-- ROLE SELECTION PHASE -->
      <RoleSelection
        v-else-if="store.gamePhase === 'role-selection'"
        :player-count="store.players.length"
        @roles-confirmed="handleRolesConfirmed"
      />

      <!-- PLAYING PHASE -->
      <GameModerator v-else-if="store.gamePhase === 'playing'" />
    </main>

    <footer class="mt-8 pb-4 text-center text-gray-500 text-sm">v{{ appVersion }}</footer>

    <!-- GLOBAL RESET MODAL -->
    <BaseModal
      :is-open="showResetModal"
      :title="$t('app.startOverConfirmTitle')"
      @close="showResetModal = false"
    >
      <div class="text-center space-y-4 py-2">
        <div class="text-red-500 text-5xl mb-2">⚠️</div>
        <p class="text-lg">{{ $t('app.startOverWarning') }}</p>
        <p class="text-sm text-gray-400">{{ $t('app.startOverSubWarning') }}</p>
      </div>

      <template #footer>
        <button
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          @click="showResetModal = false"
        >
          {{ $t('app.cancel') }}
        </button>
        <button
          class="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
          @click="confirmResetGame"
        >
          {{ $t('app.confirmStartOver') }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGameStore } from './stores/gameStore';
import { saveEncoded } from './utils/storage';
import ModeSelection from './components/ModeSelection.vue';
import PlayerEntry from './components/PlayerEntry.vue';
import RoleSelection from './components/RoleSelection.vue';
import GameModerator from './components/GameModerator.vue';
import BaseModal from './components/BaseModal.vue';

const store = useGameStore();
const appVersion = __APP_VERSION__;

// Setup Pinia subscriptions to automatically save state
store.$subscribe((mutation, state) => {
  saveEncoded('mpga_gamePhase', state.gamePhase);
  saveEncoded('mpga_gameMode', state.gameMode);
  saveEncoded('mpga_gamePlayers', state.players);
  saveEncoded('mpga_livePlayers', state.livePlayers);
  saveEncoded('mpga_subPhase', state.subPhase);
  saveEncoded('mpga_currentDay', state.currentDay);
});

// Modal State
const showResetModal = ref(false);

const handleModeSelected = (mode) => {
  store.setGameMode(mode);
};

const handlePlayersReady = (playersArray) => {
  store.setPlayers(playersArray);
};

const handleRolesConfirmed = (selectedRoles) => {
  const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
  const playersWithRoles = store.players.map((player, index) => {
    return {
      ...player,
      role: shuffledRoles[index],
    };
  });
  store.startPlaying(playersWithRoles);
};

const confirmResetGame = () => {
  store.resetGame();
  showResetModal.value = false;
};
</script>
