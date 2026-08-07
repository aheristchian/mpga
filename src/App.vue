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
        v-if="gamePhase !== 'mode-selection'"
        class="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white rounded transition-colors text-sm font-semibold flex items-center gap-2"
        @click="showResetModal = true"
      >
        <span>↺</span> {{ $t('app.startOver') }}
      </button>
    </header>

    <main class="container mx-auto pb-20">
      <!-- MODE SELECTION PHASE -->
      <ModeSelection v-if="gamePhase === 'mode-selection'" @mode-selected="handleModeSelected" />

      <!-- SETUP PHASE -->
      <PlayerEntry
        v-else-if="gamePhase === 'setup'"
        :min-players="gameMode?.minPlayers || 4"
        @players-ready="handlePlayersReady"
      />

      <!-- ROLE SELECTION PHASE -->
      <RoleSelection
        v-else-if="gamePhase === 'role-selection'"
        :player-count="gamePlayers.length"
        @roles-confirmed="handleRolesConfirmed"
      />

      <!-- PLAYING PHASE -->
      <GameModerator v-else-if="gamePhase === 'playing'" :players="gamePlayers" />
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
import { ref, onMounted, watch } from 'vue';
import ModeSelection from './components/ModeSelection.vue';
import PlayerEntry from './components/PlayerEntry.vue';
import RoleSelection from './components/RoleSelection.vue';
import GameModerator from './components/GameModerator.vue';
import BaseModal from './components/BaseModal.vue';
import { saveEncoded, loadEncoded, clearGameStorage } from './utils/storage';

const gamePhase = ref('mode-selection');
const gameMode = ref(null);
const gamePlayers = ref([]);

const appVersion = __APP_VERSION__;

onMounted(() => {
  const savedPhase = loadEncoded('mpga_gamePhase');
  if (savedPhase) gamePhase.value = savedPhase;

  const savedMode = loadEncoded('mpga_gameMode');
  if (savedMode) gameMode.value = savedMode;

  const savedPlayers = loadEncoded('mpga_gamePlayers');
  if (savedPlayers) gamePlayers.value = savedPlayers;
});

watch(gamePhase, (newPhase) => {
  saveEncoded('mpga_gamePhase', newPhase);
});

watch(
  gameMode,
  (newMode) => {
    saveEncoded('mpga_gameMode', newMode);
  },
  { deep: true }
);

watch(
  gamePlayers,
  (newPlayers) => {
    saveEncoded('mpga_gamePlayers', newPlayers);
  },
  { deep: true }
);

// Modal State
const showResetModal = ref(false);

const handleModeSelected = (mode) => {
  gameMode.value = mode;
  gamePhase.value = 'setup';
};

const handlePlayersReady = (playersArray) => {
  gamePlayers.value = playersArray;
  gamePhase.value = 'role-selection';
};

const handleRolesConfirmed = (selectedRoles) => {
  const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
  gamePlayers.value = gamePlayers.value.map((player, index) => {
    return {
      ...player,
      role: shuffledRoles[index],
    };
  });
  gamePhase.value = 'playing';
};

const confirmResetGame = () => {
  // Clear all persisted keys so there is no lingering state (like draft player lists)
  clearGameStorage();

  // Reset the reactive state which will subsequently trigger watchers
  // to save the fresh baseline state back to storage
  gamePlayers.value = [];
  gameMode.value = null;
  gamePhase.value = 'mode-selection';
  showResetModal.value = false;
};
</script>
