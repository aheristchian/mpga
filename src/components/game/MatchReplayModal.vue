<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('replay.modalTitle')"
    max-width="max-w-4xl"
    @close="handleClose"
  >
    <div class="space-y-6 py-1">
      <!-- HEADER SUMMARY & SCRUBBER BAR -->
      <div class="bg-gray-850/90 border border-gray-700/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <!-- TOP ROW: STEP COUNTER, DAY, & PHASE BADGES -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
              {{ $t('replay.step', { current: (currentStepIndex + 1), total: totalSteps }) }}
            </span>
            <span
              class="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
              :class="phaseBadgeClasses"
            >
              {{ phaseLabel }}
            </span>
            <span class="bg-amber-950/80 border border-amber-600/50 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
              {{ $t('replay.day', { day: currentSnapshot?.day || 1 }) }}
            </span>
          </div>

          <!-- PLAYBACK SPEED SELECTION -->
          <div class="flex items-center gap-1.5 bg-gray-900/90 border border-gray-700 px-2.5 py-1 rounded-xl">
            <span class="text-[11px] text-gray-400 font-bold uppercase tracking-wider me-1">{{ $t('replay.speed') }}:</span>
            <button
              v-for="s in [1, 2, 3]"
              :key="s"
              class="px-2 py-0.5 text-xs font-mono font-bold rounded-md transition-all cursor-pointer select-none"
              :class="playbackSpeed === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'"
              @click="setSpeed(s)"
            >
              {{ s }}x
            </button>
          </div>
        </div>

        <!-- RANGE SLIDER SCRUBBER -->
        <div class="space-y-1.5">
          <input
            type="range"
            min="0"
            :max="Math.max(0, totalSteps - 1)"
            :value="currentStepIndex"
            class="w-full h-2.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none transition-all shadow-inner"
            @input="onScrub"
          />
          <div class="flex justify-between items-center text-[10px] text-gray-500 font-mono px-1">
            <span>{{ $t('replay.firstStep') }} (0)</span>
            <span>{{ currentSnapshot?.timestamp || '' }}</span>
            <span>{{ $t('replay.lastStep') }} ({{ totalSteps - 1 }})</span>
          </div>
        </div>

        <!-- PLAYBACK NAVIGATION CONTROLS -->
        <div class="flex items-center justify-center gap-2 sm:gap-3 pt-1">
          <button
            class="p-2.5 sm:px-3.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold text-xs rounded-xl border border-gray-700 transition-all cursor-pointer select-none"
            :title="$t('replay.firstStep')"
            @click="firstStep"
          >
            ⏮️
          </button>
          <button
            class="p-2.5 sm:px-4 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold text-xs rounded-xl border border-gray-700 transition-all cursor-pointer select-none"
            :title="$t('replay.prevStep')"
            @click="prevStep"
          >
            ◀️
          </button>
          <button
            class="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer select-none min-h-[44px]"
            :class="isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'"
            @click="togglePlay"
          >
            <span>{{ isPlaying ? '⏸️' : '▶️' }}</span>
            <span>{{ isPlaying ? $t('replay.pause') : $t('replay.play') }}</span>
          </button>
          <button
            class="p-2.5 sm:px-4 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold text-xs rounded-xl border border-gray-700 transition-all cursor-pointer select-none"
            :title="$t('replay.nextStep')"
            @click="nextStep"
          >
            ▶️
          </button>
          <button
            class="p-2.5 sm:px-3.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold text-xs rounded-xl border border-gray-700 transition-all cursor-pointer select-none"
            :title="$t('replay.lastStep')"
            @click="lastStep"
          >
            ⏭️
          </button>
        </div>
      </div>

      <!-- ACTIVE EVENT SPOTLIGHT CARD -->
      <div
        class="border rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300"
        :class="eventCardClasses"
      >
        <div class="flex items-start gap-3 sm:gap-4">
          <div class="text-3xl sm:text-4xl shrink-0">
            {{ eventIcon }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[11px] font-bold uppercase tracking-wider opacity-75 font-mono">
                {{ currentSnapshot?.timestamp }}
              </span>
              <span class="text-xs opacity-50">•</span>
              <span class="text-xs font-semibold opacity-90 capitalize">
                {{ currentSnapshot?.type || 'event' }}
              </span>
            </div>
            <h4 class="text-lg sm:text-xl font-black text-white tracking-wide mb-1">
              {{ currentSnapshot?.title || $t('replay.initialStepTitle') }}
            </h4>
            <p class="text-xs sm:text-sm text-gray-200 leading-relaxed">
              {{ currentSnapshot?.detail || $t('replay.initialStepDetail') }}
            </p>
          </div>
        </div>
      </div>

      <!-- SIMULATED TABLE SEATING ROSTER -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <span>🛡️</span>
            <span>{{ $t('replay.playerRoster') }}</span>
          </h4>
          <span class="text-xs font-mono text-gray-400 font-semibold">
            {{ aliveCount }} {{ $t('replay.alive') }} / {{ totalCount }} {{ $t('playerEntry.players') }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="player in currentSnapshot?.roster || []"
            :key="player.name"
            class="border rounded-xl p-3 flex items-center gap-3 shadow-md transition-all duration-300 relative overflow-hidden"
            :class="getPlayerCardClasses(player)"
          >
            <!-- Highlight Aura Glow for active players in this step -->
            <div
              v-if="player.isHighlighted"
              class="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none"
            ></div>

            <RoleAvatar :role="player.role" :is-dead="player.isDead" size="sm" />
            
            <div class="min-w-0 flex-1 z-10">
              <div class="flex items-center gap-1.5">
                <p class="text-white font-bold text-xs truncate" :class="{ 'line-through text-gray-400': player.isDead }">
                  {{ player.name }}
                </p>
                <span v-if="player.isDead" class="text-[10px] text-red-400 shrink-0">💀</span>
                <span v-if="player.warningCards === 1" class="text-[10px] text-amber-400 shrink-0">🟨</span>
                <span v-if="player.warningCards >= 2" class="text-[10px] text-red-500 shrink-0">🟥</span>
              </div>

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

              <!-- Active Status Tag at this Step -->
              <div v-if="player.isHighlighted" class="mt-1">
                <span
                  class="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm text-white"
                  :class="getReasonBadgeClass(player.highlightReason)"
                >
                  {{ getReasonLabel(player.highlightReason) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end items-center w-full">
        <button
          class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer min-h-[44px] select-none"
          @click="handleClose"
        >
          {{ $t('app.cancel') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from '../BaseModal.vue';
import RoleAvatar from '../RoleAvatar.vue';
import { useGameStore } from '../../stores/gameStore';
import { useMatchReplay } from '../../services/useMatchReplay';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const store = useGameStore();

// Instantiate the replay composable from store state
const {
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
  togglePlay,
  pause,
  setSpeed,
} = useMatchReplay(store.players, store.gameLogs);

const onScrub = (event) => {
  goToStep(parseInt(event.target.value, 10) || 0);
};

const handleClose = () => {
  pause();
  emit('close');
};

const totalCount = computed(() => store.players.length || 0);
const aliveCount = computed(() => {
  return (currentSnapshot.value?.roster || []).filter((p) => !p.isDead).length;
});

const phaseLabel = computed(() => {
  const p = currentSnapshot.value?.phase || 'day';
  if (p === 'day') return '☀️ Day';
  if (p === 'voting') return '🗳️ Voting';
  if (p === 'midday') return '⚖️ Midday';
  if (p === 'night') return '🌙 Night';
  return '⚙️ Setup';
});

const phaseBadgeClasses = computed(() => {
  const p = currentSnapshot.value?.phase || 'day';
  if (p === 'day') return 'bg-amber-950/80 border border-amber-500/60 text-amber-300';
  if (p === 'voting') return 'bg-rose-950/80 border border-rose-500/60 text-rose-300';
  if (p === 'midday') return 'bg-purple-950/80 border border-purple-500/60 text-purple-300';
  if (p === 'night') return 'bg-indigo-950/80 border border-indigo-500/60 text-indigo-300';
  return 'bg-gray-800 border border-gray-600 text-gray-300';
});

const eventIcon = computed(() => {
  const action = currentSnapshot.value?.actionType;
  if (action === 'speech') return '🎙️';
  if (action === 'challenge') return '⚡';
  if (action === 'vote') return '🗳️';
  if (action === 'elimination') return '💀';
  if (action === 'revival') return '✨';
  if (action === 'penalty') return '🟨';
  if (action === 'night_action') return '🌙';
  return '📜';
});

const eventCardClasses = computed(() => {
  const p = currentSnapshot.value?.phase;
  const action = currentSnapshot.value?.actionType;

  if (action === 'elimination') {
    return 'bg-gradient-to-r from-red-950/90 via-gray-900 to-red-950/80 border-red-500/80 text-red-100 shadow-red-950/50';
  }
  if (action === 'revival') {
    return 'bg-gradient-to-r from-emerald-950/90 via-gray-900 to-emerald-950/80 border-emerald-500/80 text-emerald-100 shadow-emerald-950/50';
  }
  if (p === 'night') {
    return 'bg-gradient-to-r from-indigo-950/90 via-gray-900 to-indigo-950/80 border-indigo-500/70 text-indigo-100 shadow-indigo-950/50';
  }
  if (p === 'voting') {
    return 'bg-gradient-to-r from-rose-950/90 via-gray-900 to-rose-950/80 border-rose-500/70 text-rose-100 shadow-rose-950/50';
  }
  if (p === 'midday') {
    return 'bg-gradient-to-r from-purple-950/90 via-gray-900 to-purple-950/80 border-purple-500/70 text-purple-100 shadow-purple-950/50';
  }
  return 'bg-gradient-to-r from-amber-950/90 via-gray-900 to-amber-950/80 border-amber-500/70 text-amber-100 shadow-amber-950/50';
});

const getPlayerCardClasses = (player) => {
  if (player.isHighlighted) {
    return 'bg-indigo-950/90 border-indigo-500 shadow-indigo-900/60 scale-[1.02] ring-2 ring-indigo-400';
  }
  if (player.isDead) {
    return 'bg-gray-900/60 border-gray-800 opacity-60';
  }
  return 'bg-gray-800/90 border-gray-700';
};

const getSideColorClass = (sideId) => {
  if (sideId === 'town') return 'text-town';
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-gray-400';
};

const getReasonBadgeClass = (reason) => {
  if (reason === 'eliminated') return 'bg-red-700';
  if (reason === 'revived') return 'bg-emerald-700';
  if (reason === 'challenge') return 'bg-amber-600';
  if (reason === 'speaking') return 'bg-blue-600';
  if (reason === 'voting') return 'bg-rose-600';
  if (reason === 'night_target') return 'bg-indigo-600';
  if (reason === 'warning') return 'bg-amber-700';
  return 'bg-gray-700';
};

const getReasonLabel = (reason) => {
  if (reason === 'eliminated') return '💀 Eliminated';
  if (reason === 'revived') return '✨ Revived';
  if (reason === 'challenge') return '⚡ Challenger';
  if (reason === 'speaking') return '🎙️ Speaker';
  if (reason === 'voting') return '🗳️ Voted';
  if (reason === 'night_target') return '🌙 Night Target';
  if (reason === 'warning') return '🟨 Warning';
  return 'Active';
};
</script>
