<template>
  <div class="space-y-6 max-w-6xl mx-auto">
    <!-- TOP STATUS BAR -->
    <div
      class="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 flex justify-between items-center"
    >
      <div>
        <h2 class="text-2xl font-bold text-white">{{ $t('gameModerator.boardTitle') }}</h2>
        <div class="flex gap-4 items-center mt-2">
          <span class="text-gray-400 font-medium bg-gray-700 px-3 py-1 rounded"
            >Day {{ store.currentDay }}</span
          >
          <span class="text-indigo-400 font-medium bg-indigo-900/30 px-3 py-1 rounded capitalize"
            >{{ store.subPhase }} Phase</span
          >
        </div>
      </div>

      <button
        class="bg-red-900 hover:bg-red-800 text-red-100 px-4 py-2 rounded text-sm font-bold transition-colors"
        @click="showEndGameModal = true"
      >
        {{ $t('app.endGame') }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- LEFT COLUMN: PLAYER LIST -->
      <div class="lg:col-span-1 bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 h-fit">
        <h3 class="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">
          {{ $t('gameModerator.seatedOrder') }}
        </h3>
        <ul class="space-y-3">
          <li
            v-for="(player, index) in store.livePlayers"
            :key="index"
            class="p-3 rounded border transition-all"
            :class="[
              player.isDead
                ? 'bg-gray-900 border-gray-800 opacity-50 grayscale'
                : 'bg-gray-700 border-gray-600',
            ]"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="text-white font-bold" :class="{ 'line-through': player.isDead }">
                  {{ index + 1 }}. {{ player.name }}
                </p>
                <p
                  class="text-sm font-semibold mt-1"
                  :class="getSideColorClass(player.role?.sideId)"
                >
                  {{ player.role?.name || 'Unknown Role' }}
                </p>
              </div>
              <span
                v-if="player.isDead"
                class="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-900/30 px-2 py-1 rounded"
              >
                💀 Dead
              </span>
            </div>
          </li>
        </ul>
      </div>

      <!-- RIGHT COLUMN: MODERATOR ENGINE -->
      <div class="lg:col-span-2">
        <DayPhase v-if="store.subPhase === 'day'" />
        <VotingPhase v-else-if="store.subPhase === 'voting'" />
        <NightPhase v-else-if="store.subPhase === 'night'" />
      </div>
    </div>

    <!-- END GAME CONFIRMATION -->
    <BaseModal
      :is-open="showEndGameModal"
      :title="$t('app.endGameConfirmTitle')"
      @close="showEndGameModal = false"
    >
      <div class="text-center space-y-4 py-2">
        <div class="text-red-500 text-5xl mb-2">🛑</div>
        <p class="text-lg">{{ $t('app.endGameWarning') }}</p>
        <p class="text-sm text-gray-400">{{ $t('app.endGameSubWarning') }}</p>
      </div>

      <template #footer>
        <button
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          @click="showEndGameModal = false"
        >
          {{ $t('app.cancel') }}
        </button>
        <button
          class="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
          @click="endGame"
        >
          {{ $t('app.confirmEndGame') }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseModal from './BaseModal.vue';
import DayPhase from './game/DayPhase.vue';
import VotingPhase from './game/VotingPhase.vue';
import NightPhase from './game/NightPhase.vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

const getSideColorClass = (sideId) => {
  if (sideId === 'town') return 'text-town';
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-gray-400';
};

// End Game Modal State
const showEndGameModal = ref(false);

const endGame = () => {
  store.resetGame();
  window.location.reload();
};
</script>
