<template>
  <div class="space-y-6">
    <!-- ATMOSPHERIC HERO BANNER -->
    <PhaseHeroBanner phase="day" :day="store.currentDay">
      <template #action>
        <!-- STEP INDICATOR -->
        <div
          class="flex items-center gap-2 text-xs font-bold bg-gray-900/60 p-1.5 rounded-xl border border-amber-500/30"
        >
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'setup'
                ? 'bg-amber-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('dayPhase.step1Badge') }}
          </span>
          <span class="text-gray-600">→</span>
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'speaking'
                ? 'bg-amber-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('dayPhase.step2Badge') }}
          </span>
          <span class="text-gray-600">→</span>
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'wrapup'
                ? 'bg-amber-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('dayPhase.step3Badge') }}
          </span>
        </div>
      </template>
    </PhaseHeroBanner>

    <div
      class="bg-gray-850 rounded-2xl p-4 sm:p-6 border border-amber-500/30 shadow-2xl shadow-amber-950/20 text-white"
    >
      <!-- STAGE 1: SETUP (Shift & Direction) -->
      <div v-if="stage === 'setup'" class="space-y-6">
        <div class="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
          <h3 class="text-lg font-bold text-amber-400 mb-2">{{ $t('dayPhase.step1Title') }}</h3>
          <p class="text-sm text-gray-300 mb-4">
            {{
              $t('dayPhase.shiftNotice', {
                day: store.currentDay,
                seat: calculatedStartIndex + 1,
                name: calculatedStartPlayer?.name || '',
              })
            }}
          </p>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              class="p-4 rounded-xl border font-bold flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 select-none min-h-[44px]"
              :class="
                direction === 'clockwise'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              "
              @click="direction = 'clockwise'"
            >
              <span class="text-2xl">↻</span>
              <span>{{ $t('dayPhase.clockwise') }}</span>
            </button>
            <button
              type="button"
              class="p-4 rounded-xl border font-bold flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 select-none min-h-[44px]"
              :class="
                direction === 'counter-clockwise'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              "
              @click="direction = 'counter-clockwise'"
            >
              <span class="text-2xl">↺</span>
              <span>{{ $t('dayPhase.counterClockwise') }}</span>
            </button>
          </div>

          <!-- PLANNED ORDER PREVIEW -->
          <div>
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {{ $t('dayPhase.speakingOrderPreview') }}
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(p, idx) in previewQueue"
                :key="p.name"
                class="px-3 py-1.5 bg-gray-700/80 border border-gray-600 rounded-lg text-xs font-semibold flex items-center gap-2"
                :class="{ 'border-amber-500 text-amber-300': idx === 0 }"
              >
                <span class="opacity-60">{{ idx + 1 }}.</span>
                <span>{{ p.name }}</span>
                <span
                  v-if="usedChallengeToday.has(p.name)"
                  class="text-[9px] bg-gray-800 text-gray-400 px-1 py-0.2 rounded"
                  :title="$t('dayPhase.challengeUsedBadge')"
                >
                  ⚡
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            class="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-gray-950 px-8 py-3.5 rounded-xl font-black text-base shadow-lg shadow-amber-500/20 transition-all cursor-pointer select-none min-h-[44px]"
            @click="startDayFlow"
          >
            {{ $t('dayPhase.startDayFlow') }} ▶
          </button>
        </div>
      </div>

      <!-- STAGE 2: SINGLE SPEAKER SPOTLIGHT -->
      <div v-else-if="stage === 'speaking' && currentPlayer" class="space-y-6">
        <!-- SPOTLIGHT CARD -->
        <div
          class="bg-gradient-to-b from-gray-800 to-gray-850 p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl relative text-center"
        >
          <!-- Direction Badge -->
          <div
            class="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 bg-gray-900/80 rounded-full border border-gray-700 text-gray-300"
          >
            {{ direction === 'clockwise' ? '↻ Clockwise' : '↺ Counter-Clockwise' }}
          </div>

          <!-- Active Challenge Banner -->
          <div
            v-if="activeChallenger"
            class="mb-4 p-3 bg-amber-950/80 border border-amber-500/60 rounded-xl flex items-center justify-between gap-3 text-left"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-2xl animate-bounce">⚡</span>
              <div>
                <p class="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  {{
                    $t('dayPhase.challengeFrom', {
                      challenger: activeChallenger.name,
                      speaker: currentPlayer.name,
                    })
                  }}
                </p>
                <p class="text-[11px] text-gray-300">
                  {{ currentPlayer.name }}'s time paused at {{ savedSpeakerTime }}s
                </p>
              </div>
            </div>
            <button
              class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer select-none shadow"
              @click="endChallenge"
            >
              {{ $t('dayPhase.endChallenge', { speaker: currentPlayer.name }) }}
            </button>
          </div>

          <!-- Speaker Counter -->
          <div class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
            {{
              $t('dayPhase.speakerProgress', {
                current: currentSpeakerIndex + 1,
                total: totalSpeakersCount,
              })
            }}
          </div>

          <!-- Speaker Avatar & Identity -->
          <div class="flex flex-col items-center mb-4">
            <RoleAvatar
              :role="activeChallenger ? activeChallenger.role : currentPlayer.role"
              size="xl"
            />
            <h3 class="text-3xl font-black text-white mt-3">
              {{ activeChallenger ? activeChallenger.name : currentPlayer.name }}
            </h3>
            <p
              class="text-sm font-semibold mt-0.5"
              :class="
                getSideColorClass(
                  activeChallenger ? activeChallenger.role?.sideId : currentPlayer.role?.sideId
                )
              "
            >
              {{
                $te(
                  'roles.' +
                    (activeChallenger ? activeChallenger.role?.id : currentPlayer.role?.id) +
                    '.name'
                )
                  ? $t(
                      'roles.' +
                        (activeChallenger ? activeChallenger.role?.id : currentPlayer.role?.id) +
                        '.name'
                    )
                  : (activeChallenger
                      ? activeChallenger.role?.name
                      : currentPlayer.role?.name || 'Citizen')
              }}
            </p>
            <span
              v-if="(activeChallenger || currentPlayer).isSilenced"
              class="mt-2 text-xs bg-purple-900/60 border border-purple-600 text-purple-300 px-3 py-0.5 rounded-full font-bold"
            >
              🤫 {{ $t('gameModerator.silencedBadge') }}
            </span>
          </div>

          <!-- Large Digital Timer -->
          <div
            class="text-7xl font-mono font-black mb-6 tracking-tight drop-shadow-lg transition-colors select-none"
            :class="
              timeLeft <= 5
                ? 'text-red-500 animate-pulse'
                : activeChallenger
                  ? 'text-amber-400'
                  : 'text-white'
            "
          >
            {{ formattedTime }}
          </div>

          <!-- Timer Controls -->
          <div class="flex flex-wrap justify-center gap-3 mb-6">
            <button
              v-if="!isRunning && timeLeft > 0"
              class="bg-green-600 hover:bg-green-500 active:scale-95 active:brightness-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px] select-none"
              @click="startTimer"
            >
              <span>▶</span> {{ $t('dayPhase.start') }}
            </button>
            <button
              v-if="isRunning"
              class="bg-yellow-600 hover:bg-yellow-500 active:scale-95 active:brightness-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px] select-none"
              @click="pauseTimer"
            >
              <span>⏸</span> {{ $t('dayPhase.pause') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] select-none"
              @click="resetCurrentTimer"
            >
              ↺ {{ $t('dayPhase.reset') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] select-none"
              @click="adjustTime(10)"
            >
              {{ $t('dayPhase.plus10') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] select-none"
              @click="adjustTime(-10)"
            >
              {{ $t('dayPhase.minus10') }}
            </button>
          </div>

          <!-- Secondary Actions (Challenge Time & Status Override) -->
          <div class="flex flex-wrap justify-center gap-3 pt-4 border-t border-gray-700/60">
            <!-- Grant Challenge Time Button -->
            <button
              v-if="!activeChallenger"
              :disabled="hasUsedChallengeThisTurn"
              class="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all border cursor-pointer active:scale-95 select-none min-h-[44px]"
              :class="
                hasUsedChallengeThisTurn
                  ? 'bg-gray-850 border-gray-700 text-gray-500 opacity-60 cursor-not-allowed'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-500/20'
              "
              @click="openChallengeSelector"
            >
              <span>⚡</span>
              <span>{{
                $t('dayPhase.challengeTime', {
                  seconds: store.gameMode?.borrowedTimeToTalk || 25,
                })
              }}</span>
            </button>

            <!-- End Challenge Button (When in challenge) -->
            <button
              v-else
              class="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 select-none min-h-[44px]"
              @click="endChallenge"
            >
              <span>↩</span>
              <span>{{ $t('dayPhase.endChallenge', { speaker: currentPlayer.name }) }}</span>
            </button>

            <button
              class="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-600 text-gray-300 hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer select-none min-h-[44px]"
              @click="openPlayerStatus(activeChallenger || currentPlayer)"
            >
              <span>🛡️</span> {{ $t('gameModerator.adjustStatus') }}
            </button>
          </div>
        </div>

        <!-- UP NEXT QUEUE -->
        <div class="bg-gray-800/60 p-4 rounded-xl border border-gray-700">
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            {{ $t('dayPhase.upNext') }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(player, idx) in speakingQueue"
              :key="player.name"
              class="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
              :class="{ 'opacity-40': idx > 3 }"
            >
              <span>{{ idx + 1 }}. {{ player.name }}</span>
              <span
                v-if="usedChallengeToday.has(player.name)"
                class="text-[9px] bg-gray-800 text-gray-400 px-1 py-0.2 rounded"
                :title="$t('dayPhase.challengeUsedBadge')"
              >
                ⚡
              </span>
            </span>
            <span v-if="speakingQueue.length === 0" class="text-xs text-gray-500 italic">
              Last speaker of the day.
            </span>
          </div>
        </div>

        <!-- NEXT SPEAKER / ADVANCE -->
        <div class="flex justify-between items-center pt-2">
          <button
            class="text-xs text-gray-500 hover:text-red-400 underline transition-colors cursor-pointer py-2 px-1"
            @click="forceEndDay"
          >
            {{ $t('dayPhase.forceEndDay') }}
          </button>

          <button
            class="bg-blue-600 hover:bg-blue-500 active:scale-95 active:brightness-90 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer select-none min-h-[44px]"
            @click="nextPlayer"
          >
            <span>{{ $t('dayPhase.nextPlayer') }}</span>
            <span>⏭</span>
          </button>
        </div>
      </div>

      <!-- STAGE 3: DAY WRAP-UP -->
      <div
        v-else
        class="text-center py-12 space-y-6 bg-gray-800/40 rounded-2xl border border-gray-700 p-8"
      >
        <div class="text-6xl">🌇</div>
        <div>
          <h3 class="text-2xl font-bold text-white mb-2">{{ $t('dayPhase.step3Title') }}</h3>
          <p class="text-gray-300 text-sm max-w-md mx-auto">
            {{ $t('dayPhase.allSpoken', { day: store.currentDay }) }}
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-4">
          <button
            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-300 rounded-xl font-semibold transition-all text-sm cursor-pointer select-none min-h-[44px]"
            @click="stage = 'setup'"
          >
            ↺ Review Queue
          </button>
          <button
            class="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 active:scale-95 text-white font-black text-base rounded-xl shadow-xl shadow-red-600/30 transition-all cursor-pointer select-none min-h-[44px]"
            @click="proceedToVoting"
          >
            ⚖️ {{ $t('dayPhase.confirmProceedVoting') }}
          </button>
        </div>
      </div>

      <!-- CHALLENGE PLAYER SELECTION MODAL -->
      <BaseModal
        :is-open="showChallengeModal"
        :title="$t('dayPhase.selectChallenger')"
        @close="showChallengeModal = false"
      >
        <div class="space-y-4">
          <p class="text-xs text-gray-300">
            {{ $t('dayPhase.selectChallengerPrompt') }}
          </p>

          <div v-if="eligibleChallengers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
            <button
              v-for="p in eligibleChallengers"
              :key="p.name"
              class="p-3 bg-gray-800 hover:bg-amber-950/60 active:scale-95 border border-gray-700 hover:border-amber-500 text-white rounded-xl text-left font-bold text-sm transition-all cursor-pointer flex items-center justify-between select-none min-h-[44px]"
              @click="grantChallengeTo(p)"
            >
              <div class="flex items-center gap-2">
                <RoleAvatar :role="p.role" size="sm" />
                <span>{{ p.name }}</span>
              </div>
              <span class="text-amber-400 text-xs">⚡ {{ store.gameMode?.borrowedTimeToTalk || 25 }}s</span>
            </button>
          </div>

          <div v-else class="text-center py-6 bg-gray-800/40 rounded-xl text-xs text-gray-400">
            {{ $t('dayPhase.noEligibleChallengers') }}
          </div>

          <div class="flex justify-end pt-2">
            <button
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-xs font-bold cursor-pointer active:scale-95"
              @click="showChallengeModal = false"
            >
              {{ $t('app.cancel') }}
            </button>
          </div>
        </div>
      </BaseModal>

      <!-- PLAYER STATUS OVERRIDE MODAL -->
      <PlayerStatusModal
        :is-open="showStatusModal"
        :player="selectedPlayerForStatus"
        @close="showStatusModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import { useAudio } from '../../services/useAudioService';
import PhaseHeroBanner from '../PhaseHeroBanner.vue';
import RoleAvatar from '../RoleAvatar.vue';
import BaseModal from '../BaseModal.vue';
import PlayerStatusModal from '../PlayerStatusModal.vue';

const store = useGameStore();
const audio = useAudio();

const stage = ref('setup'); // 'setup', 'speaking', 'wrapup'
const direction = ref('clockwise');
const speakingQueue = ref([]);
const currentPlayer = ref(null);
const currentSpeakerIndex = ref(0);
const totalSpeakersCount = ref(0);

// Challenge Mechanics
const usedChallengeToday = ref(new Set());
const activeChallenger = ref(null);
const savedSpeakerTime = ref(0);
const hasUsedChallengeThisTurn = ref(false);
const showChallengeModal = ref(false);

// Timer State
const timeLeft = ref(0);
const isRunning = ref(false);
let timerInterval = null;

// Modal
const showStatusModal = ref(false);
const selectedPlayerForStatus = ref(null);

const alivePlayers = computed(() => store.livePlayers.filter((p) => !p.isDead));

const calculatedStartIndex = computed(() => {
  if (alivePlayers.value.length === 0) return 0;
  const shiftAmount = store.gameMode?.nextDayShift || 1;
  return ((store.currentDay - 1) * shiftAmount) % alivePlayers.value.length;
});

const calculatedStartPlayer = computed(() => {
  return alivePlayers.value[calculatedStartIndex.value] || alivePlayers.value[0];
});

const previewQueue = computed(() => {
  const alive = alivePlayers.value;
  if (!alive.length) return [];
  const start = calculatedStartIndex.value;
  if (direction.value === 'clockwise') {
    return [...alive.slice(start), ...alive.slice(0, start)];
  } else {
    return [...alive.slice(0, start + 1).reverse(), ...alive.slice(start + 1).reverse()];
  }
});

const eligibleChallengers = computed(() => {
  if (!currentPlayer.value) return [];
  return alivePlayers.value.filter(
    (p) => p.name !== currentPlayer.value.name && !usedChallengeToday.value.has(p.name)
  );
});

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

const getSideColorClass = (sideId) => {
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-town';
};

const startDayFlow = () => {
  usedChallengeToday.value.clear();
  speakingQueue.value = [...previewQueue.value];
  totalSpeakersCount.value = speakingQueue.value.length;
  currentSpeakerIndex.value = 0;
  stage.value = 'speaking';
  loadNextSpeaker();
};

const loadNextSpeaker = () => {
  pauseTimer();
  activeChallenger.value = null;
  savedSpeakerTime.value = 0;
  hasUsedChallengeThisTurn.value = false;
  if (speakingQueue.value.length > 0) {
    currentPlayer.value = speakingQueue.value.shift();
    timeLeft.value = store.gameMode?.timeToTalk || 40;
  } else {
    currentPlayer.value = null;
    stage.value = 'wrapup';
  }
};

const nextPlayer = () => {
  if (activeChallenger.value) {
    endChallenge();
  }
  if (currentPlayer.value) {
    store.addLog(
      'day',
      `Speaker Finished: ${currentPlayer.value.name}`,
      `Finished speaking turn on Day ${store.currentDay}.`,
      { player: currentPlayer.value.name }
    );
  }
  currentSpeakerIndex.value++;
  loadNextSpeaker();
};

const resetCurrentTimer = () => {
  pauseTimer();
  if (activeChallenger.value) {
    timeLeft.value = store.gameMode?.borrowedTimeToTalk || 25;
  } else {
    timeLeft.value = store.gameMode?.timeToTalk || 40;
  }
};

const adjustTime = (seconds) => {
  timeLeft.value = Math.max(0, timeLeft.value + seconds);
};

const openChallengeSelector = () => {
  if (hasUsedChallengeThisTurn.value || activeChallenger.value) return;
  showChallengeModal.value = true;
};

const grantChallengeTo = (challengerPlayer) => {
  pauseTimer();
  savedSpeakerTime.value = timeLeft.value;
  activeChallenger.value = challengerPlayer;
  usedChallengeToday.value.add(challengerPlayer.name);
  hasUsedChallengeThisTurn.value = true;
  showChallengeModal.value = false;

  const challengeSeconds = store.gameMode?.borrowedTimeToTalk || 25;
  timeLeft.value = challengeSeconds;

  store.addLog(
    'day',
    `⚡ Challenge Granted: ${challengerPlayer.name}`,
    `Took challenge time from ${currentPlayer.value?.name} (${challengeSeconds}s).`,
    { challenger: challengerPlayer.name, speaker: currentPlayer.value?.name }
  );
};

const endChallenge = () => {
  pauseTimer();
  const challengerName = activeChallenger.value?.name;
  activeChallenger.value = null;
  timeLeft.value = savedSpeakerTime.value;

  store.addLog(
    'day',
    `Challenge Finished: ${challengerName}`,
    `Speaking turn resumed for ${currentPlayer.value?.name} with ${timeLeft.value}s remaining.`,
    { challenger: challengerName, speaker: currentPlayer.value?.name }
  );
};

const forceEndDay = () => {
  pauseTimer();
  activeChallenger.value = null;
  speakingQueue.value = [];
  currentPlayer.value = null;
  stage.value = 'wrapup';
};

const startTimer = () => {
  if (isRunning.value || timeLeft.value <= 0) return;
  isRunning.value = true;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
      if (timeLeft.value <= 3 && timeLeft.value > 0) {
        audio.playUrgentTick();
      } else if (timeLeft.value <= 10 && timeLeft.value > 0) {
        audio.playTick();
      } else if (timeLeft.value === 0) {
        audio.playGong();
        if (activeChallenger.value) {
          endChallenge();
        }
      }
    } else {
      pauseTimer();
    }
  }, 1000);
};

const pauseTimer = () => {
  isRunning.value = false;
  if (timerInterval) clearInterval(timerInterval);
};

const openPlayerStatus = (player) => {
  selectedPlayerForStatus.value = player;
  showStatusModal.value = true;
};

const proceedToVoting = () => {
  store.setSubPhase('voting');
};

onMounted(() => {
  stage.value = 'setup';
});

onUnmounted(() => {
  pauseTimer();
});
</script>
