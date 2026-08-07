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
        v-if="gamePhase !== 'setup'"
        class="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white rounded transition-colors text-sm font-semibold flex items-center gap-2"
        @click="showResetModal = true"
      >
        <span>↺</span> {{ $t('app.startOver') }}
      </button>
    </header>

    <main class="container mx-auto pb-20">
      <!-- SETUP PHASE -->
      <PlayerEntry v-if="gamePhase === 'setup'" @players-ready="handlePlayersReady" />

      <!-- ROLE SELECTION PHASE -->
      <RoleSelection
        v-else-if="gamePhase === 'role-selection'"
        :player-count="gamePlayers.length"
        @roles-confirmed="handleRolesConfirmed"
      />

      <!-- PLAYING PHASE -->
      <GameModerator v-else-if="gamePhase === 'playing'" :players="gamePlayers" />
    </main>

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
import PlayerEntry from './components/PlayerEntry.vue';
import RoleSelection from './components/RoleSelection.vue';
import GameModerator from './components/GameModerator.vue';
import BaseModal from './components/BaseModal.vue';

const gamePhase = ref('setup');
const gamePlayers = ref([]);

// Modal State
const showResetModal = ref(false);

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
  gamePlayers.value = [];
  gamePhase.value = 'setup';
  showResetModal.value = false;
};
</script>
