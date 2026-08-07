<template>
  <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <h2 class="text-xl font-bold text-white mb-4">
      {{ $t('dayPhase.title') }} (Day {{ currentDay }})
    </h2>

    <div v-if="currentPlayer" class="bg-gray-700 p-6 rounded-lg text-center mb-6 relative">
      <!-- Speaking Direction Indicator -->
      <div class="absolute top-2 right-4 text-gray-400 text-sm">
        <span v-if="direction === 'clockwise'">↻ {{ $t('dayPhase.clockwise') }}</span>
        <span v-else>↺ {{ $t('dayPhase.counterClockwise') }}</span>
      </div>

      <h3 class="text-2xl font-bold text-town mb-2">{{ currentPlayer.name }}</h3>
      <p class="text-gray-400 mb-6">{{ $t('dayPhase.isSpeaking') }}</p>

      <!-- Timer Display -->
      <div
        class="text-6xl font-mono mb-6"
        :class="{ 'text-red-500': timeLeft <= 5, 'text-white': timeLeft > 5 }"
      >
        {{ formattedTime }}
      </div>

      <!-- Controls -->
      <div class="flex justify-center gap-4">
        <button
          v-if="!isRunning && timeLeft > 0"
          class="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold"
          @click="startTimer"
        >
          ▶ {{ $t('dayPhase.start') }}
        </button>
        <button
          v-if="isRunning"
          class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold"
          @click="pauseTimer"
        >
          ⏸ {{ $t('dayPhase.pause') }}
        </button>
        <button
          class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold"
          @click="nextPlayer"
        >
          ⏭ {{ $t('dayPhase.nextPlayer') }}
        </button>
      </div>
    </div>

    <!-- Upcoming List -->
    <div class="mt-8">
      <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {{ $t('dayPhase.upNext') }}
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(player, index) in speakingQueue"
          :key="player.name"
          class="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm"
          :class="{ 'opacity-50': index > 2 }"
        >
          {{ player.name }}
        </span>
      </div>
    </div>

    <!-- End Phase Button -->
    <div class="mt-8 pt-6 border-t border-gray-700 flex justify-end">
      <button
        v-if="speakingQueue.length === 0 && !currentPlayer"
        class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold shadow-md"
        @click="$emit('phase-complete')"
      >
        {{ $t('dayPhase.proceedToVote') }}
      </button>
      <button
        v-else
        class="text-gray-500 hover:text-red-400 text-sm underline"
        @click="forceEndDay"
      >
        {{ $t('dayPhase.forceEndDay') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  players: { type: Array, required: true },
  modeConfig: { type: Object, required: true },
  currentDay: { type: Number, default: 1 },
});

defineEmits(['phase-complete']);

const direction = ref('clockwise'); // or 'counter-clockwise'
const speakingQueue = ref([]);
const currentPlayer = ref(null);

// Timer State
const timeLeft = ref(0);
const isRunning = ref(false);
let timerInterval = null;

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

// Setup the queue based on shift logic
const initQueue = () => {
  // Only living players speak
  const alivePlayers = props.players.filter((p) => !p.isDead);

  if (alivePlayers.length === 0) return;

  // Calculate starting index based on the day shift config
  // e.g., if shift is 2, Day 1 starts at 0, Day 2 at 2, Day 3 at 4
  const shiftAmount = props.modeConfig.nextDayShift || 1;
  const startIndex = ((props.currentDay - 1) * shiftAmount) % alivePlayers.length;

  if (direction.value === 'clockwise') {
    speakingQueue.value = [...alivePlayers.slice(startIndex), ...alivePlayers.slice(0, startIndex)];
  } else {
    // Reverse the logic for counter-clockwise
    speakingQueue.value = [
      ...alivePlayers.slice(startIndex, -1).reverse(),
      ...alivePlayers.slice(0, startIndex).reverse(),
    ];
  }

  nextPlayer();
};

const nextPlayer = () => {
  pauseTimer();
  if (speakingQueue.value.length > 0) {
    currentPlayer.value = speakingQueue.value.shift();
    timeLeft.value = props.modeConfig.timeToTalk || 40;
  } else {
    currentPlayer.value = null;
  }
};

const forceEndDay = () => {
  pauseTimer();
  speakingQueue.value = [];
  currentPlayer.value = null;
};

// Timer Controls
const startTimer = () => {
  if (isRunning.value || timeLeft.value <= 0) return;
  isRunning.value = true;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      pauseTimer();
      // Optional: Play a sound or visual alert here
    }
  }, 1000);
};

const pauseTimer = () => {
  isRunning.value = false;
  if (timerInterval) clearInterval(timerInterval);
};

onMounted(() => {
  initQueue();
});

onUnmounted(() => {
  pauseTimer();
});
</script>
