<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- TOP STATUS & CONTROLS BAR -->
    <div
      class="bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-700 flex flex-wrap justify-between items-center gap-4"
    >
      <div class="flex items-center gap-4">
        <div>
          <h2 class="text-2xl font-black text-white tracking-wide">
            {{ $t('gameModerator.boardTitle') }}
          </h2>
          <div class="flex gap-2 items-center mt-1">
            <span
              class="text-amber-400 font-bold bg-amber-950/60 border border-amber-600/40 px-3 py-0.5 rounded-full text-xs"
            >
              Day {{ store.currentDay }}
            </span>
            <span
              class="font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wider"
              :class="getPhaseBadgeClass(store.subPhase)"
            >
              {{ store.subPhase }} Phase
            </span>
            <span class="text-xs text-gray-400 font-semibold">
              ({{ aliveCount }} Alive / {{ store.livePlayers.length }} Total)
            </span>
          </div>
        </div>
      </div>

      <!-- RIGHT CONTROLS (EVENT LOG, GAME OVER, END GAME) -->
      <div class="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <!-- Game Over Summary Button -->
        <button
          v-if="store.isGameOver"
          class="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-gray-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2 animate-bounce cursor-pointer"
          @click="store.reopenGameOverModal"
        >
          <span>🏆</span>
          <span>Match Ended ({{ store.winner?.toUpperCase() }})</span>
        </button>

        <!-- Game Guide Button -->
        <button
          class="bg-gray-800 hover:bg-amber-950/80 border border-gray-700 hover:border-amber-500/50 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          :title="$t('app.gameGuide')"
          @click="showGuideModal = true"
        >
          <span>📖</span>
          <span class="hidden sm:inline">{{ $t('app.gameGuideShort') }}</span>
        </button>

        <!-- 1-Step Undo Button -->
        <button
          v-if="store.canUndo"
          class="bg-amber-700/80 hover:bg-amber-600 active:scale-95 text-white border border-amber-500/60 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          :title="$t('app.undoLastAction')"
          @click="handleUndo"
        >
          <span>⏪</span>
          <span class="hidden sm:inline">{{ $t('app.undo') }}</span>
        </button>

        <!-- Event Log Button -->
        <button
          class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          @click="showLogDrawer = true"
        >
          <span>📜</span>
          <span>{{ $t('app.openLogs') }}</span>
          <span
            class="bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono"
          >
            {{ store.gameLogs.length }}
          </span>
        </button>

        <!-- Phase Switcher Pills -->
        <div
          class="hidden md:flex bg-gray-900 p-1 rounded-xl border border-gray-700 text-xs font-semibold"
        >
          <button
            v-for="p in ['day', 'voting', 'midday', 'night']"
            :key="p"
            class="px-2.5 py-1 rounded-lg capitalize transition-colors"
            :class="
              store.subPhase === p
                ? 'bg-gray-700 text-white font-bold shadow-sm'
                : 'text-gray-400 hover:text-white'
            "
            @click="store.setSubPhase(p)"
          >
            {{ p }}
          </button>
        </div>

        <!-- End Game Button -->
        <button
          class="bg-red-900/80 hover:bg-red-800 border border-red-700 text-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          @click="showEndGameModal = true"
        >
          {{ $t('app.endGame') }}
        </button>
      </div>
    </div>

    <!-- MAIN TWO-COLUMN DASHBOARD -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- LEFT COLUMN: PLAYER MANAGEMENT & SEATING (4 cols) -->
      <div
        class="lg:col-span-4 bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-700 h-fit space-y-4"
      >
        <div class="flex justify-between items-center border-b border-gray-700 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">{{ $t('gameModerator.seatedOrder') }}</h3>
            <p class="text-[11px] text-gray-400">Click actions to override state at any point</p>
          </div>
          <span class="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full font-bold">
            {{ aliveCount }} / {{ store.livePlayers.length }} Alive
          </span>
        </div>

        <ul class="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
          <li
            v-for="(player, index) in store.livePlayers"
            :key="player.name"
            class="p-3 rounded-xl border transition-all"
            :class="[
              player.isDead
                ? 'bg-gray-900/90 border-gray-800 opacity-60'
                : 'bg-gray-750 border-gray-650 hover:border-gray-500',
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <!-- Player Info & Avatar -->
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-xs font-bold font-mono text-gray-500 w-4">{{ index + 1 }}</span>
                <RoleAvatar :role="player.role" :is-dead="player.isDead" size="sm" />
                <div class="min-w-0">
                  <p
                    class="text-white font-bold text-sm truncate"
                    :class="{ 'line-through text-gray-500': player.isDead }"
                  >
                    {{ player.name }}
                  </p>
                  <p
                    class="text-[11px] font-semibold truncate"
                    :class="getSideColorClass(player.role?.sideId)"
                  >
                    {{ player.role?.name || 'Unknown' }}
                  </p>
                </div>
              </div>

              <!-- Quick Status Badges & Override Actions -->
              <div class="flex items-center gap-1 shrink-0">
                <!-- Warnings Badge -->
                <span
                  v-if="player.warnings > 0"
                  class="text-[10px] bg-yellow-900/60 border border-yellow-700 text-yellow-300 px-1.5 py-0.5 rounded font-bold"
                  title="Warnings"
                >
                  ⚠️{{ player.warnings }}
                </span>

                <!-- Silenced Badge -->
                <span
                  v-if="player.isSilenced"
                  class="text-[10px] bg-purple-900/60 border border-purple-700 text-purple-300 px-1.5 py-0.5 rounded font-bold"
                  title="Silenced"
                >
                  🤫
                </span>

                <!-- Quick Kill/Revive Button -->
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-xs font-bold transition-colors"
                  :class="
                    player.isDead
                      ? 'bg-green-900/70 hover:bg-green-800 text-green-300 border border-green-700'
                      : 'bg-red-900/70 hover:bg-red-800 text-red-300 border border-red-700'
                  "
                  :title="player.isDead ? 'Revive Player' : 'Kill Player'"
                  @click="toggleDeathStatus(player)"
                >
                  {{ player.isDead ? '💚' : '💀' }}
                </button>

                <!-- Full Status/Penalty Modal Button -->
                <button
                  type="button"
                  class="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-colors border border-gray-600"
                  title="Adjust Status, Warnings, Reason"
                  @click="openPlayerStatusModal(player)"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- RIGHT COLUMN: GUIDED PHASE ENGINE (8 cols) -->
      <div class="lg:col-span-8">
        <DayPhase v-if="store.subPhase === 'day'" />
        <VotingPhase v-else-if="store.subPhase === 'voting'" />
        <MiddayPhase v-else-if="store.subPhase === 'midday'" />
        <NightPhase v-else-if="store.subPhase === 'night'" />
      </div>
    </div>

    <!-- MODALS & DRAWERS -->
    <PlayerStatusModal
      :is-open="showStatusModal"
      :player="selectedPlayerForModal"
      @close="showStatusModal = false"
    />

    <GameLogDrawer :is-open="showLogDrawer" @close="showLogDrawer = false" />

    <!-- GAME OVER CELEBRATION MODAL -->
    <GameOverModal :is-open="store.showGameOverModal" @close="store.dismissGameOverModal" />

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

    <!-- IN-GAME GUIDE & ROLE HIERARCHY MODAL -->
    <GameGuideModal :is-open="showGuideModal" @close="showGuideModal = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseModal from './BaseModal.vue';
import GameOverModal from './GameOverModal.vue';
import RoleAvatar from './RoleAvatar.vue';
import PlayerStatusModal from './PlayerStatusModal.vue';
import GameLogDrawer from './GameLogDrawer.vue';
import DayPhase from './game/DayPhase.vue';
import VotingPhase from './game/VotingPhase.vue';
import MiddayPhase from './game/MiddayPhase.vue';
import NightPhase from './game/NightPhase.vue';
import GameGuideModal from './GameGuideModal.vue';
import { useGameStore } from '../stores/gameStore';

import { useMultiplayer } from '../services/useMultiplayerService';
import { useAudio } from '../services/useAudioService';

const store = useGameStore();
const multiplayer = useMultiplayer();
const audio = useAudio();

const aliveCount = computed(() => store.livePlayers.filter((p) => !p.isDead).length);

const showLogDrawer = ref(false);
const showStatusModal = ref(false);
const showGuideModal = ref(false);
const selectedPlayerForModal = ref(null);
const showEndGameModal = ref(false);

const handleUndo = () => {
  const undone = store.undoLastAction();
  if (undone) {
    audio.playTick();
    multiplayer.broadcastGameState();
  }
};

const getSideColorClass = (sideId) => {
  if (sideId === 'town') return 'text-town';
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-gray-400';
};

const getPhaseBadgeClass = (phase) => {
  switch (phase) {
    case 'day':
      return 'bg-amber-950/70 border border-amber-600 text-amber-300';
    case 'voting':
      return 'bg-orange-950/70 border border-orange-600 text-orange-300';
    case 'midday':
      return 'bg-purple-950/70 border border-purple-600 text-purple-300';
    case 'night':
      return 'bg-indigo-950/70 border border-indigo-600 text-indigo-300';
    default:
      return 'bg-gray-700 text-gray-300';
  }
};

const openPlayerStatusModal = (player) => {
  selectedPlayerForModal.value = player;
  showStatusModal.value = true;
};

const toggleDeathStatus = (player) => {
  const nextIsDead = !player.isDead;
  const reason = nextIsDead ? 'Quick Moderator Elimination' : 'Quick Moderator Revive';
  store.setPlayerDeathStatus(player.name, nextIsDead, reason);
};

const endGame = () => {
  store.resetGame();
  window.location.reload();
};
</script>
