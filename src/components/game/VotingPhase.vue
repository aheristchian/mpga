<template>
  <div class="space-y-6">
    <!-- ATMOSPHERIC HERO BANNER -->
    <PhaseHeroBanner phase="voting" :day="store.currentDay">
      <template #action>
        <!-- STEP INDICATOR -->
        <div
          class="flex items-center gap-2 text-xs font-bold bg-gray-900/60 p-1.5 rounded-xl border border-orange-500/30"
        >
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'pre-vote'
                ? 'bg-orange-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('votingPhase.step1Badge') }}
          </span>
          <span class="text-gray-600">→</span>
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'defense'
                ? 'bg-orange-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('votingPhase.step2Badge') }}
          </span>
          <span class="text-gray-600">→</span>
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'final-vote'
                ? 'bg-orange-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('votingPhase.step3Badge') }}
          </span>
        </div>
      </template>
    </PhaseHeroBanner>

    <div
      class="bg-gray-850 rounded-2xl p-6 border border-orange-500/30 shadow-2xl shadow-orange-950/20 text-white"
    >
      <!-- STAGE 1: PRE-VOTE (Qualification) -->
      <div v-if="stage === 'pre-vote'" class="space-y-6">
        <div
          class="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center"
        >
          <div>
            <h3 class="text-base font-bold text-orange-400">
              {{ $t('votingPhase.preVoteTitle') }}
            </h3>
            <p class="text-xs text-gray-300">{{ $t('votingPhase.preVoteSubtitle') }}</p>
          </div>
          <div
            class="bg-orange-950/60 border border-orange-500/40 text-orange-300 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            {{
              $t('votingPhase.voteThresholdInfo', {
                threshold: votingThreshold,
                maxVotes: maxVotesPerCandidate,
                alive: alivePlayers.length,
              })
            }}
          </div>
        </div>

        <!-- TALLY LIST -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="player in alivePlayers"
            :key="player.name"
            class="flex items-center justify-between p-3.5 rounded-xl border transition-all"
            :class="
              (preVotes[player.name] || 0) >= votingThreshold
                ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500/40'
                : 'bg-gray-800/90 border-gray-700'
            "
          >
            <div class="flex items-center gap-3">
              <RoleAvatar :role="player.role" size="sm" />
              <div>
                <span class="text-white font-bold text-sm block">{{ player.name }}</span>
                <span
                  v-if="(preVotes[player.name] || 0) >= votingThreshold"
                  class="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider"
                >
                  ★ Qualified
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                :disabled="!preVotes[player.name]"
                @click="updatePreVote(player, -1)"
              >
                -
              </button>
              <span
                class="w-8 text-center text-lg font-black font-mono"
                :class="
                  (preVotes[player.name] || 0) >= votingThreshold ? 'text-orange-400' : 'text-white'
                "
              >
                {{ preVotes[player.name] || 0 }}
              </span>
              <button
                class="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                :disabled="(preVotes[player.name] || 0) >= maxVotesPerCandidate"
                @click="updatePreVote(player, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- STAGE 1 ACTIONS -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-700">
          <span class="text-xs text-gray-400">
            {{ qualifiedDefenders.length }} Defender(s) qualified
          </span>

          <button
            v-if="qualifiedDefenders.length > 0"
            class="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            @click="startDefenseStage"
          >
            {{ $t('votingPhase.startDefense', { count: qualifiedDefenders.length }) }} ▶
          </button>
          <button
            v-else
            class="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            @click="skipDefenseToNight"
          >
            {{ $t('votingPhase.proceedToNight') }} (No Defenders)
          </button>
        </div>
      </div>

      <!-- STAGE 2: DEFENSE STAGE -->
      <div v-else-if="stage === 'defense'" class="space-y-6">
        <div
          v-if="qualifiedDefenders.length === 0"
          class="text-center py-12 bg-gray-800/40 rounded-xl border border-gray-700"
        >
          <p class="text-gray-400 italic mb-4">{{ $t('votingPhase.noDefenders') }}</p>
          <button
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all"
            @click="skipDefenseToNight"
          >
            {{ $t('votingPhase.proceedToNight') }}
          </button>
        </div>

        <div
          v-else-if="currentDefender"
          class="bg-gradient-to-b from-gray-800 to-gray-850 p-6 rounded-2xl border-2 border-orange-500/40 shadow-2xl text-center"
        >
          <!-- Progress Counter -->
          <div class="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">
            {{
              $t('votingPhase.defenderProgress', {
                current: currentDefenderIndex + 1,
                total: qualifiedDefenders.length,
              })
            }}
          </div>

          <div class="flex flex-col items-center mb-4">
            <RoleAvatar :role="currentDefender.role" size="xl" />
            <h3 class="text-3xl font-black text-white mt-3">{{ currentDefender.name }}</h3>
            <p class="text-xs text-orange-300 font-semibold mt-0.5">
              {{ $t('votingPhase.isDefending') }}
            </p>
          </div>

          <!-- Timer Display -->
          <div
            class="text-7xl font-mono font-black mb-6 tracking-tight drop-shadow-lg transition-colors"
            :class="defenseTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'"
          >
            {{ formattedDefenseTime }}
          </div>

          <!-- Timer Controls -->
          <div class="flex justify-center gap-3 mb-6">
            <button
              v-if="!isDefenseRunning && defenseTimeLeft > 0"
              class="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
              @click="startDefenseTimer"
            >
              <span>▶</span> {{ $t('dayPhase.start') }}
            </button>
            <button
              v-if="isDefenseRunning"
              class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
              @click="pauseDefenseTimer"
            >
              <span>⏸</span> {{ $t('dayPhase.pause') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all"
              @click="resetDefenseTimer"
            >
              ↺ {{ $t('dayPhase.reset') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all"
              @click="defenseTimeLeft = Math.max(0, defenseTimeLeft + 10)"
            >
              +10s
            </button>
          </div>

          <!-- UP NEXT DEFENDERS -->
          <div
            v-if="defenseQueue.length > 0"
            class="bg-gray-800/80 p-3 rounded-lg border border-gray-700 inline-block text-xs text-gray-400"
          >
            Up next:
            <span class="text-white font-bold">{{
              defenseQueue.map((d) => d.name).join(', ')
            }}</span>
          </div>

          <!-- NEXT DEFENDER BUTTON -->
          <div class="mt-6 flex justify-end">
            <button
              class="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all cursor-pointer"
              @click="nextDefender"
            >
              <span>{{
                defenseQueue.length > 0
                  ? $t('dayPhase.nextPlayer')
                  : $t('votingPhase.proceedToFinalVote')
              }}</span>
              <span>⏭</span>
            </button>
          </div>
        </div>
      </div>

      <!-- STAGE 3: CLOSED-EYE FINAL VOTE -->
      <div v-else-if="stage === 'final-vote'" class="space-y-6">
        <!-- CLOSED EYE PROMPT SCRIPT -->
        <div class="bg-red-950/40 border-2 border-red-500/60 p-4 rounded-xl shadow-lg">
          <div class="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
            <span>🙈</span>
            <h4>{{ $t('votingPhase.closedEyeNotice') }}</h4>
          </div>
          <p class="text-sm text-gray-200 italic leading-relaxed">
            {{ $t('votingPhase.closedEyeTownPrompt') }}
          </p>
          <p class="text-xs text-red-300/80 mt-2 font-medium">
            {{ $t('votingPhase.finalVoteSubtitle', { maxVotes: maxVotesPerCandidate }) }}
          </p>
        </div>

        <!-- FINAL VOTE TALLY CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="defender in qualifiedDefenders"
            :key="defender.name"
            class="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center"
          >
            <div class="flex items-center gap-3">
              <RoleAvatar :role="defender.role" size="md" />
              <div>
                <span class="text-white font-bold block">{{ defender.name }}</span>
                <span class="text-xs text-gray-400">{{ defender.role?.name }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                :disabled="!finalVotes[defender.name]"
                @click="updateFinalVote(defender, -1)"
              >
                -
              </button>
              <span class="w-10 text-center text-2xl font-black font-mono text-red-400">
                {{ finalVotes[defender.name] || 0 }}
              </span>
              <button
                class="w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                :disabled="(finalVotes[defender.name] || 0) >= maxVotesPerCandidate"
                @click="updateFinalVote(defender, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- FINAL VOTE SUMMARY & ACTIONS -->
        <div
          class="bg-gray-800/80 p-5 rounded-xl border border-gray-700 flex justify-between items-center"
        >
          <div>
            <h4 class="text-sm font-bold text-gray-300">Vote Outcome:</h4>
            <p v-if="hasTie" class="text-yellow-400 font-bold text-sm">
              {{
                $t('votingPhase.tieBetween', { names: tiedPlayers.map((p) => p.name).join(' & ') })
              }}
            </p>
            <p v-else-if="eliminatedCandidate" class="text-red-400 font-bold text-sm">
              {{ $t('votingPhase.eliminatedAnnouncement', { name: eliminatedCandidate.name }) }}
            </p>
            <p v-else class="text-gray-400 text-sm">
              {{ $t('votingPhase.nobodyDies') }}
            </p>
          </div>

          <div class="flex gap-3">
            <!-- TIE BREAKER BUTTON -->
            <button
              v-if="hasTie"
              class="bg-yellow-600 hover:bg-yellow-500 text-gray-950 px-6 py-3 rounded-xl font-black shadow-lg shadow-yellow-600/30 animate-pulse transition-all cursor-pointer"
              @click="resolveTieSpin"
            >
              🎲 {{ $t('votingPhase.resolveTie') }}
            </button>

            <!-- CONFIRM ELIMINATION / PROCEED -->
            <button
              v-else-if="eliminatedCandidate"
              class="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              @click="confirmElimination(eliminatedCandidate)"
            >
              💀 {{ $t('votingPhase.eliminate', { name: eliminatedCandidate.name }) }}
            </button>

            <button
              v-else
              class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all cursor-pointer"
              @click="confirmNobodyDies"
            >
              🌙 {{ $t('votingPhase.proceedStraightToNight') }}
            </button>
          </div>
        </div>
      </div>

      <!-- TIE BREAKER ROULETTE OVERLAY -->
      <Teleport to="body">
        <div
          v-if="showTieBreakerOverlay"
          class="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[150] p-4"
        >
          <div
            class="text-center space-y-6 max-w-md bg-gray-900 p-8 rounded-2xl border border-yellow-500/50 shadow-2xl"
          >
            <div class="text-6xl animate-bounce">🎲</div>
            <h3 class="text-xl font-bold text-yellow-400">
              {{ $t('votingPhase.destinyIsDeciding') }}
            </h3>
            <div
              class="text-4xl font-black font-mono text-white tracking-wider py-4 bg-gray-800 rounded-xl border border-gray-700"
            >
              {{ rotatingTieName }}
            </div>
            <p class="text-xs text-gray-400">The player selected by fate will be eliminated.</p>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../../stores/gameStore';
import { useAudio } from '../../services/useAudioService';
import {
  calculateVotingThreshold,
  calculateMaxVotesPerCandidate,
  clampVotes,
} from '../../services/useVotingService';
import PhaseHeroBanner from '../PhaseHeroBanner.vue';
import RoleAvatar from '../RoleAvatar.vue';

const store = useGameStore();
const audio = useAudio();

const stage = ref('pre-vote'); // 'pre-vote', 'defense', 'final-vote'
const preVotes = ref({});
const qualifiedDefenders = ref([]);
const defenseQueue = ref([]);
const currentDefender = ref(null);
const currentDefenderIndex = ref(0);
const finalVotes = ref({});

// Defense Timer
const defenseTimeLeft = ref(0);
const isDefenseRunning = ref(false);
let defenseTimerInterval = null;

// Tie Breaker
const showTieBreakerOverlay = ref(false);
const rotatingTieName = ref('');

const alivePlayers = computed(() => store.livePlayers.filter((p) => !p.isDead));

const votingThreshold = computed(() =>
  calculateVotingThreshold(
    alivePlayers.value.length,
    store.gameMode?.votingThresholdRounding || 'ceil'
  )
);

const maxVotesPerCandidate = computed(() =>
  calculateMaxVotesPerCandidate(alivePlayers.value.length)
);

const formattedDefenseTime = computed(() => {
  const m = Math.floor(defenseTimeLeft.value / 60);
  const s = defenseTimeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

// Stage 1
const updatePreVote = (player, delta) => {
  audio.playVoteClick();
  preVotes.value[player.name] = clampVotes(
    preVotes.value[player.name],
    delta,
    alivePlayers.value.length
  );
  updateQualifiedDefenders();
};

const updateQualifiedDefenders = () => {
  qualifiedDefenders.value = alivePlayers.value.filter(
    (p) => (preVotes.value[p.name] || 0) >= votingThreshold.value
  );
};

const startDefenseStage = () => {
  updateQualifiedDefenders();
  if (qualifiedDefenders.value.length === 0) {
    skipDefenseToNight();
    return;
  }

  store.addLog(
    'voting',
    'Pre-Vote Stage Concluded',
    `${qualifiedDefenders.value.length} defenders qualified: ${qualifiedDefenders.value.map((p) => p.name).join(', ')}`
  );

  defenseQueue.value = [...qualifiedDefenders.value];
  currentDefenderIndex.value = 0;
  stage.value = 'defense';
  loadNextDefender();
};

const skipDefenseToNight = () => {
  store.addLog(
    'voting',
    'Voting Ended (No Defenders)',
    'No player reached threshold. Advancing to Night.'
  );
  store.setSubPhase('night');
};

// Stage 2: Defense
const loadNextDefender = () => {
  pauseDefenseTimer();
  if (defenseQueue.value.length > 0) {
    currentDefender.value = defenseQueue.value.shift();
    defenseTimeLeft.value = store.gameMode?.defenseTimeToTalk || 60;
  } else {
    currentDefender.value = null;
    stage.value = 'final-vote';
  }
};

const nextDefender = () => {
  if (currentDefender.value) {
    store.addLog(
      'voting',
      `Defender Finished: ${currentDefender.value.name}`,
      `Finished defense speech.`
    );
  }
  currentDefenderIndex.value++;
  loadNextDefender();
};

const startDefenseTimer = () => {
  if (isDefenseRunning.value || defenseTimeLeft.value <= 0) return;
  isDefenseRunning.value = true;
  defenseTimerInterval = setInterval(() => {
    if (defenseTimeLeft.value > 0) {
      defenseTimeLeft.value--;
      if (defenseTimeLeft.value <= 3 && defenseTimeLeft.value > 0) {
        audio.playUrgentTick();
      } else if (defenseTimeLeft.value <= 10 && defenseTimeLeft.value > 0) {
        audio.playTick();
      } else if (defenseTimeLeft.value === 0) {
        audio.playGong();
      }
    } else {
      pauseDefenseTimer();
    }
  }, 1000);
};

const pauseDefenseTimer = () => {
  isDefenseRunning.value = false;
  if (defenseTimerInterval) clearInterval(defenseTimerInterval);
};

const resetDefenseTimer = () => {
  pauseDefenseTimer();
  defenseTimeLeft.value = store.gameMode?.defenseTimeToTalk || 60;
};

// Stage 3: Final Vote
const updateFinalVote = (defender, delta) => {
  audio.playVoteClick();
  finalVotes.value[defender.name] = clampVotes(
    finalVotes.value[defender.name],
    delta,
    alivePlayers.value.length
  );
};

const maxVotes = computed(() => {
  const vals = Object.values(finalVotes.value);
  if (!vals.length) return 0;
  return Math.max(...vals);
});

const tiedPlayers = computed(() => {
  if (maxVotes.value === 0) return [];
  return qualifiedDefenders.value.filter((p) => finalVotes.value[p.name] === maxVotes.value);
});

const hasTie = computed(() => tiedPlayers.value.length > 1);

const eliminatedCandidate = computed(() => {
  if (hasTie.value || maxVotes.value === 0) return null;
  return tiedPlayers.value[0];
});

const confirmElimination = (player) => {
  store.setPlayerDeathStatus(player.name, true, 'Eliminated by Town Vote');
  store.setEliminatedPlayer(player);
  store.addLog(
    'voting',
    `Eliminated by Town Vote: ${player.name}`,
    `Received ${finalVotes.value[player.name]} final votes. Proceeding to Midday Phase.`,
    { player: player.name, role: player.role?.name }
  );
  store.setSubPhase('midday');
};

const confirmNobodyDies = () => {
  store.addLog(
    'voting',
    'Voting Ended (No Elimination)',
    'Nobody received votes. Proceeding to Night Phase.'
  );
  store.setSubPhase('night');
};

const resolveTieSpin = () => {
  showTieBreakerOverlay.value = true;
  const candidates = tiedPlayers.value;
  let spins = 0;
  const maxSpins = 25 + Math.floor(Math.random() * 10);
  let intervalMs = 50;

  const spin = () => {
    rotatingTieName.value = candidates[spins % candidates.length].name;
    audio.playRouletteTick();
    spins++;

    if (spins < maxSpins) {
      if (spins > maxSpins - 10) intervalMs += 35;
      setTimeout(spin, intervalMs);
    } else {
      audio.playGong();
      setTimeout(() => {
        showTieBreakerOverlay.value = false;
        const loser = candidates[(spins - 1) % candidates.length];
        confirmElimination(loser);
      }, 1500);
    }
  };

  spin();
};

onMounted(() => {
  stage.value = 'pre-vote';
});

onUnmounted(() => {
  pauseDefenseTimer();
});
</script>
