<template>
  <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <h2 class="text-xl font-bold text-white mb-4">
      {{ $t('votingPhase.title') }} (Day {{ store.currentDay }})
    </h2>

    <!-- STAGE 1: PRE-VOTE -->
    <div v-if="stage === 'pre-vote'">
      <p class="text-gray-400 mb-4">{{ $t('votingPhase.preVoteSubtitle') }}</p>

      <div class="space-y-3 mb-6">
        <div
          v-for="player in alivePlayers"
          :key="player.name"
          class="flex items-center justify-between bg-gray-700 p-3 rounded"
        >
          <span class="text-white font-semibold">{{ player.name }}</span>
          <div class="flex items-center gap-3">
            <button
              class="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-white font-bold"
              :disabled="!preVotes[player.name]"
              @click="updateVote(player, -1)"
            >
              -
            </button>
            <span class="w-8 text-center text-xl font-bold text-town">
              {{ preVotes[player.name] || 0 }}
            </span>
            <button
              class="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-white font-bold"
              @click="updateVote(player, 1)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold"
          @click="startDefense"
        >
          {{ $t('votingPhase.startDefense') }}
        </button>
      </div>
    </div>

    <!-- STAGE 2: DEFENSE -->
    <div v-else-if="stage === 'defense'">
      <p class="text-gray-400 mb-4">{{ $t('votingPhase.defenseSubtitle') }}</p>

      <div v-if="defenders.length === 0" class="text-center py-8">
        <p class="text-gray-400 italic mb-4">{{ $t('votingPhase.noDefenders') }}</p>
        <button
          class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded font-bold"
          @click="endVoting(null)"
        >
          {{ $t('votingPhase.proceedToNight') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Defense Timer for current defender -->
        <div v-if="currentDefender" class="bg-gray-700 p-6 rounded-lg text-center">
          <h3 class="text-2xl font-bold text-town mb-2">{{ currentDefender.name }}</h3>
          <p class="text-gray-400 mb-4">{{ $t('votingPhase.isDefending') }}</p>

          <div class="text-6xl font-mono mb-4 text-white">
            {{ formattedTime }}
          </div>

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
              @click="nextDefender"
            >
              ⏭ {{ $t('dayPhase.nextPlayer') }}
            </button>
          </div>
        </div>

        <div v-if="!currentDefender && defenders.length > 0" class="flex justify-end">
          <button
            class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold"
            @click="stage = 'final-vote'"
          >
            {{ $t('votingPhase.proceedToFinalVote') }}
          </button>
        </div>
      </div>
    </div>

    <!-- STAGE 3: FINAL VOTE -->
    <div v-else-if="stage === 'final-vote'">
      <p class="text-gray-400 mb-4">{{ $t('votingPhase.finalVoteSubtitle') }}</p>

      <div class="space-y-3 mb-6">
        <div
          v-for="player in defenders"
          :key="player.name"
          class="flex items-center justify-between bg-gray-700 p-3 rounded"
        >
          <span class="text-white font-semibold">{{ player.name }}</span>
          <div class="flex items-center gap-3">
            <button
              class="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-white font-bold"
              :disabled="!finalVotes[player.name]"
              @click="updateFinalVote(player, -1)"
            >
              -
            </button>
            <span class="w-8 text-center text-xl font-bold text-red-400">
              {{ finalVotes[player.name] || 0 }}
            </span>
            <button
              class="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 text-white font-bold"
              @click="updateFinalVote(player, 1)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <!-- Tie Breaker Visual -->
        <button
          v-if="hasTie"
          class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded font-bold animate-pulse"
          @click="resolveTie"
        >
          {{ $t('votingPhase.resolveTie') }}
        </button>

        <button
          v-else
          class="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold"
          @click="confirmElimination"
        >
          {{
            eliminatedPlayer
              ? $t('votingPhase.eliminate', { name: eliminatedPlayer.name })
              : $t('votingPhase.nobodyDies')
          }}
        </button>
      </div>

      <!-- Tie Breaker Overlay -->
      <div
        v-if="showTieBreaker"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <div class="text-center">
          <div class="text-6xl font-bold text-town mb-8 animate-bounce">
            {{ rotatingTieName }}
          </div>
          <p class="text-gray-400">{{ $t('votingPhase.destinyIsDeciding') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  players: { type: Array, required: true },
  modeConfig: { type: Object, required: true },
  currentDay: { type: Number, default: 1 },
});

const emit = defineEmits(['phase-complete', 'player-eliminated']);

const alivePlayers = computed(() => props.players.filter((p) => !p.isDead));

// State
const stage = ref('pre-vote'); // 'pre-vote', 'defense', 'final-vote'
const preVotes = ref({});
const defenders = ref([]);
const currentDefender = ref(null);
const finalVotes = ref({});

// Timer State
const timeLeft = ref(0);
const isRunning = ref(false);
let timerInterval = null;

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

// Stage 1: Pre-Vote
const updateVote = (player, amount) => {
  const current = preVotes.value[player.name] || 0;
  preVotes.value[player.name] = Math.max(0, current + amount);
};

const startDefense = () => {
  const totalAlive = alivePlayers.value.length;
  const roundingMode = props.modeConfig.votingThresholdRounding || 'half';

  let threshold = totalAlive / 2;
  if (roundingMode === 'ceil') threshold = Math.ceil(threshold);
  else if (roundingMode === 'floor') threshold = Math.floor(threshold);
  else threshold = Math.round(threshold);

  defenders.value = alivePlayers.value.filter((p) => (preVotes.value[p.name] || 0) >= threshold);

  if (defenders.value.length > 0) {
    stage.value = 'defense';
    nextDefender();
  } else {
    // Nobody reached threshold
    stage.value = 'defense'; // will show "no defenders" UI
  }
};

// Stage 2: Defense
const nextDefender = () => {
  pauseTimer();
  const currentIndex = currentDefender.value
    ? defenders.value.findIndex((p) => p.name === currentDefender.value.name)
    : -1;

  if (currentIndex + 1 < defenders.value.length) {
    currentDefender.value = defenders.value[currentIndex + 1];
    timeLeft.value = props.modeConfig.defenseTimeToTalk || 60;
  } else {
    currentDefender.value = null; // Done with defense
  }
};

const startTimer = () => {
  if (isRunning.value || timeLeft.value <= 0) return;
  isRunning.value = true;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      pauseTimer();
    }
  }, 1000);
};

const pauseTimer = () => {
  isRunning.value = false;
  if (timerInterval) clearInterval(timerInterval);
};

// Stage 3: Final Vote
const updateFinalVote = (player, amount) => {
  const current = finalVotes.value[player.name] || 0;
  finalVotes.value[player.name] = Math.max(0, current + amount);
};

const maxFinalVotes = computed(() => {
  if (Object.keys(finalVotes.value).length === 0) return 0;
  return Math.max(...Object.values(finalVotes.value));
});

const tiedPlayers = computed(() => {
  const max = maxFinalVotes.value;
  if (max === 0) return [];
  return defenders.value.filter((p) => finalVotes.value[p.name] === max);
});

const hasTie = computed(() => tiedPlayers.value.length > 1);

const eliminatedPlayer = computed(() => {
  if (hasTie.value || maxFinalVotes.value === 0) return null;
  return tiedPlayers.value[0];
});

const endVoting = (playerToEliminate) => {
  if (playerToEliminate) {
    emit('player-eliminated', playerToEliminate);
  }
  emit('phase-complete');
};

const confirmElimination = () => {
  endVoting(eliminatedPlayer.value);
};

// Tie Breaker Visual logic
const showTieBreaker = ref(false);
const rotatingTieName = ref('');

const resolveTie = () => {
  showTieBreaker.value = true;
  const candidates = tiedPlayers.value;

  let spins = 0;
  const maxSpins = 20 + Math.floor(Math.random() * 10);
  let intervalMs = 50;

  const spin = () => {
    rotatingTieName.value = candidates[spins % candidates.length].name;
    spins++;

    if (spins < maxSpins) {
      // Slow down towards the end
      if (spins > maxSpins - 10) intervalMs += 30;
      setTimeout(spin, intervalMs);
    } else {
      // Final selection
      setTimeout(() => {
        showTieBreaker.value = false;
        // The person the spinner lands on is ELIMINATED
        const loser = candidates[(spins - 1) % candidates.length];
        endVoting(loser);
      }, 1500);
    }
  };

  spin();
};
</script>
