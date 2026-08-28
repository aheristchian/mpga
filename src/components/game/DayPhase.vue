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
      class="bg-gray-850 rounded-2xl p-6 border border-amber-500/30 shadow-2xl shadow-amber-950/20 text-white"
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
              class="p-4 rounded-xl border font-bold flex items-center justify-center gap-3 transition-all"
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
              class="p-4 rounded-xl border font-bold flex items-center justify-center gap-3 transition-all"
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
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            class="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 px-8 py-3 rounded-xl font-black text-base shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
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
            <RoleAvatar :role="currentPlayer.role" size="xl" />
            <h3 class="text-3xl font-black text-white mt-3">{{ currentPlayer.name }}</h3>
            <p
              class="text-sm font-semibold mt-0.5"
              :class="getSideColorClass(currentPlayer.role?.sideId)"
            >
              {{ currentPlayer.role?.name || 'Unknown Role' }}
            </p>
            <span
              v-if="currentPlayer.isSilenced"
              class="mt-2 text-xs bg-purple-900/60 border border-purple-600 text-purple-300 px-3 py-0.5 rounded-full font-bold"
            >
              🤫 {{ $t('gameModerator.silencedBadge') }}
            </span>
          </div>

          <!-- Large Digital Timer -->
          <div
            class="text-7xl font-mono font-black mb-6 tracking-tight drop-shadow-lg transition-colors"
            :class="
              timeLeft <= 5
                ? 'text-red-500 animate-pulse'
                : isChallengeActive
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
              class="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
              @click="startTimer"
            >
              <span>▶</span> {{ $t('dayPhase.start') }}
            </button>
            <button
              v-if="isRunning"
              class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
              @click="pauseTimer"
            >
              <span>⏸</span> {{ $t('dayPhase.pause') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all"
              @click="resetSpeakerTimer"
            >
              ↺ {{ $t('dayPhase.reset') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all"
              @click="adjustTime(10)"
            >
              {{ $t('dayPhase.plus10') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all"
              @click="adjustTime(-10)"
            >
              {{ $t('dayPhase.minus10') }}
            </button>
          </div>

          <!-- Secondary Actions (Challenge Time & Status Override) -->
          <div class="flex justify-center gap-4 pt-4 border-t border-gray-700/60">
            <button
              class="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all border"
              :class="
                isChallengeActive
                  ? 'bg-amber-600 text-white border-amber-400'
                  : 'bg-gray-800 text-amber-400 border-amber-500/40 hover:bg-amber-500/10'
              "
              @click="toggleChallengeTime"
            >
              <span>⚡</span>
              <span>{{
                isChallengeActive
                  ? $t('dayPhase.challengeActive')
                  : $t('dayPhase.challengeTime', {
                      seconds: store.gameMode?.borrowedTimeToTalk || 25,
                    })
              }}</span>
            </button>

            <button
              class="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all"
              @click="openPlayerStatus(currentPlayer)"
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
              class="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs font-medium"
              :class="{ 'opacity-40': idx > 3 }"
            >
              {{ idx + 1 }}. {{ player.name }}
            </span>
            <span v-if="speakingQueue.length === 0" class="text-xs text-gray-500 italic">
              Last speaker of the day.
            </span>
          </div>
        </div>

        <!-- NEXT SPEAKER / ADVANCE -->
        <div class="flex justify-between items-center pt-2">
          <button
            class="text-xs text-gray-500 hover:text-red-400 underline transition-colors"
            @click="forceEndDay"
          >
            {{ $t('dayPhase.forceEndDay') }}
          </button>

          <button
            class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
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

        <div class="flex justify-center gap-4">
          <button
            class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold transition-all text-sm"
            @click="stage = 'setup'"
          >
            ↺ Review Queue
          </button>
          <button
            class="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-base rounded-xl shadow-xl shadow-red-600/30 transition-all cursor-pointer"
            @click="proceedToVoting"
          >
            ⚖️ {{ $t('dayPhase.confirmProceedVoting') }}
          </button>
        </div>
      </div>

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
import PlayerStatusModal from '../PlayerStatusModal.vue';

const store = useGameStore();
const audio = useAudio();

const stage = ref('setup'); // 'setup', 'speaking', 'wrapup'
const direction = ref('clockwise');
const speakingQueue = ref([]);
const currentPlayer = ref(null);
const currentSpeakerIndex = ref(0);
const totalSpeakersCount = ref(0);

// Timer State
const timeLeft = ref(0);
const isRunning = ref(false);
const isChallengeActive = ref(false);
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
  speakingQueue.value = [...previewQueue.value];
  totalSpeakersCount.value = speakingQueue.value.length;
  currentSpeakerIndex.value = 0;
  stage.value = 'speaking';
  loadNextSpeaker();
};

const loadNextSpeaker = () => {
  pauseTimer();
  isChallengeActive.value = false;
  if (speakingQueue.value.length > 0) {
    currentPlayer.value = speakingQueue.value.shift();
    timeLeft.value = store.gameMode?.timeToTalk || 40;
  } else {
    currentPlayer.value = null;
    stage.value = 'wrapup';
  }
};

const nextPlayer = () => {
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

const resetSpeakerTimer = () => {
  pauseTimer();
  isChallengeActive.value = false;
  timeLeft.value = store.gameMode?.timeToTalk || 40;
};

const adjustTime = (seconds) => {
  timeLeft.value = Math.max(0, timeLeft.value + seconds);
};

const toggleChallengeTime = () => {
  const bonus = store.gameMode?.borrowedTimeToTalk || 25;
  if (!isChallengeActive.value) {
    isChallengeActive.value = true;
    timeLeft.value += bonus;
    store.addLog(
      'day',
      `Challenge Time Activated: ${currentPlayer.value?.name}`,
      `Granted +${bonus}s challenge time.`,
      { player: currentPlayer.value?.name }
    );
  } else {
    isChallengeActive.value = false;
    timeLeft.value = Math.max(0, timeLeft.value - bonus);
  }
};

const forceEndDay = () => {
  pauseTimer();
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
