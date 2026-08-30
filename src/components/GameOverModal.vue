<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('gameOver.title')"
    max-width="max-w-3xl"
    @close="handleClose"
  >
    <div class="space-y-5 py-1">
      <!-- WINNING FACTION BANNER -->
      <div
        class="text-center p-5 sm:p-6 rounded-2xl border shadow-2xl relative overflow-hidden"
        :class="winnerBannerClasses"
      >
        <!-- Background Ambient Glow -->
        <div class="text-5xl sm:text-6xl mb-2 animate-bounce">
          {{ isTownWin ? '🏆' : isMafiaWin ? '👑' : '⚖️' }}
        </div>

        <h3 class="text-2xl sm:text-3xl font-black tracking-wide text-white mb-1.5">
          {{
            isTownWin
              ? $t('gameOver.townVictoryTitle')
              : isMafiaWin
                ? $t('gameOver.mafiaVictoryTitle')
                : 'Game Concluded'
          }}
        </h3>
        <p class="text-xs sm:text-sm max-w-lg mx-auto opacity-90 font-medium">
          {{
            isTownWin
              ? $t('gameOver.townVictorySubtitle')
              : isMafiaWin
                ? $t('gameOver.mafiaVictorySubtitle')
                : ''
          }}
        </p>

        <!-- Nostradamus Co-Victory Notification -->
        <div
          v-if="evaluation.nostradamusWins"
          class="mt-3 inline-flex items-center gap-2 bg-purple-950/80 border border-purple-500 text-purple-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg"
        >
          <span>🔮</span>
          <span
            >{{ $t('gameOver.nostradamusVictory') }} ({{
              $t('gameOver.nostradamusSubtitle', { side: evaluation.winner?.toUpperCase() })
            }})</span
          >
        </div>
      </div>

      <!-- SURVIVING PLAYERS ROSTER -->
      <div>
        <h4
          class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"
        >
          <span>🛡️</span> {{ $t('gameOver.survivingHeroes') }} ({{ survivingPlayers.length }})
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="player in survivingPlayers"
            :key="player.name"
            class="bg-gray-800/90 border border-gray-700 rounded-xl p-3 flex items-center gap-3 shadow-md"
          >
            <RoleAvatar :role="player.role" :is-dead="false" size="sm" />
            <div class="min-w-0">
              <p class="text-white font-bold text-xs truncate">{{ player.name }}</p>
              <p
                class="text-[10px] font-semibold truncate"
                :class="getSideColorClass(player.role?.sideId)"
              >
                {{
                  $te('roles.' + player.role?.id + '.name')
                    ? $t('roles.' + player.role?.id + '.name')
                    : player.role?.name || 'Citizen'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- MATCH STATISTICS GRID -->
      <div>
        <h4
          class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"
        >
          <span>📊</span> {{ $t('gameOver.matchStats') }}
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700 text-center">
            <span class="text-xs text-gray-400 font-semibold block">{{
              $t('gameOver.totalDays')
            }}</span>
            <span class="text-2xl font-black text-amber-400 font-mono">{{ stats.totalDays }}</span>
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700 text-center">
            <span class="text-xs text-gray-400 font-semibold block">{{
              $t('gameOver.totalEliminated')
            }}</span>
            <span class="text-2xl font-black text-red-400 font-mono">{{
              stats.totalEliminated
            }}</span>
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700 text-center">
            <span class="text-xs text-gray-400 font-semibold block">{{
              $t('gameOver.doctorSaves')
            }}</span>
            <span class="text-2xl font-black text-green-400 font-mono">{{
              stats.doctorSaves
            }}</span>
          </div>
          <div class="bg-gray-800 p-3 rounded-xl border border-gray-700 text-center">
            <span class="text-xs text-gray-400 font-semibold block">{{
              $t('gameOver.detectiveHits')
            }}</span>
            <span class="text-2xl font-black text-blue-400 font-mono">{{
              stats.detectiveHits
            }}</span>
          </div>
        </div>
      </div>

      <!-- DECISIVE HIGHLIGHTS TIMELINE -->
      <div v-if="highlightLogs.length > 0">
        <h4
          class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"
        >
          <span>⚡</span> {{ $t('gameOver.timelineHighlights') }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="log in highlightLogs"
            :key="log.id"
            class="bg-gray-800/60 p-2.5 rounded-lg border border-gray-700 text-xs flex justify-between items-start gap-2"
          >
            <div>
              <span class="font-bold text-white">{{ log.title }}</span>
              <p class="text-gray-400 text-[11px] mt-0.5">{{ log.detail }}</p>
            </div>
            <span class="text-[10px] font-mono text-gray-500 shrink-0">Day {{ log.day }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center w-full gap-3">
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            class="w-full sm:w-auto px-5 py-2.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 font-semibold text-xs rounded-xl transition-all cursor-pointer min-h-[44px] select-none text-center"
            @click="handleClose"
          >
            {{ $t('gameOver.reviewBoard') }}
          </button>
          <button
            class="w-full sm:w-auto px-4 py-2.5 bg-indigo-700 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] select-none"
            @click="showStoryModal = true"
          >
            <span>📸</span>
            <span>{{ $t('storyCard.shareStoryBtn') }}</span>
          </button>
          <button
            class="w-full sm:w-auto px-4 py-2.5 bg-purple-700 hover:bg-purple-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] select-none"
            @click="showReplayModal = true"
          >
            <span>⏪</span>
            <span>{{ $t('replay.openReplay') }}</span>
          </button>
        </div>
        <button
          class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 active:brightness-90 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer min-h-[44px] select-none text-center"
          @click="startNewGame"
        >
          {{ $t('gameOver.newGame') }}
        </button>
      </div>
    </template>
  </BaseModal>

  <!-- MATCH STORY CARD EXPORT MODAL -->
  <MatchStoryCardModal
    :is-open="showStoryModal"
    :winner="evaluation.winner || 'town'"
    :survivors="survivingPlayers"
    :current-day="store.currentDay"
    :total-players="store.livePlayers.length"
    @close="showStoryModal = false"
  />

  <!-- POST-MATCH TIME TRAVEL REPLAY MODAL -->
  <MatchReplayModal
    :is-open="showReplayModal"
    @close="showReplayModal = false"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import RoleAvatar from './RoleAvatar.vue';
import MatchStoryCardModal from './game/MatchStoryCardModal.vue';
import MatchReplayModal from './game/MatchReplayModal.vue';
import { useGameStore } from '../stores/gameStore';
import { useAudio } from '../services/useAudioService';
import { evaluateGameStatus } from '../services/useWinCondition';

const showStoryModal = ref(false);
const showReplayModal = ref(false);

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const store = useGameStore();
const audio = useAudio();

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      audio.playFanfare();
      if (audio.autoPlayOnPhaseChange.value && !audio.isMuted.value) {
        audio.playVictoryMusic(evaluation.value.winner);
      }
    }
  }
);

const evaluation = computed(() => {
  return evaluateGameStatus(store.livePlayers, store.gameLogs, store.nostradamusChoice);
});

const isTownWin = computed(() => evaluation.value.winner === 'town');
const isMafiaWin = computed(() => evaluation.value.winner === 'mafia');

const survivingPlayers = computed(() => evaluation.value.survivingPlayers || []);
const stats = computed(() => evaluation.value.stats || {});

const winnerBannerClasses = computed(() => {
  if (isTownWin.value) {
    return 'bg-gradient-to-r from-blue-950 via-gray-900 to-blue-900/60 border-blue-500 text-blue-100 shadow-blue-950/60';
  }
  if (isMafiaWin.value) {
    return 'bg-gradient-to-r from-red-950 via-gray-900 to-red-900/60 border-red-500 text-red-100 shadow-red-950/60';
  }
  return 'bg-gradient-to-r from-purple-950 via-gray-900 to-purple-900/60 border-purple-500 text-purple-100';
});

const highlightLogs = computed(() => {
  return store.gameLogs
    .filter(
      (l) =>
        l.type === 'night' || l.type === 'voting' || l.type === 'midday' || l.type === 'moderator'
    )
    .slice(0, 6);
});

const getSideColorClass = (sideId) => {
  if (sideId === 'town') return 'text-town';
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-gray-400';
};

const handleClose = () => {
  store.dismissGameOverModal();
  emit('close');
};

const startNewGame = () => {
  store.resetGame();
  window.location.reload();
};
</script>
