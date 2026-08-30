<template>
  <div
    class="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden relative"
  >
    <!-- BACKGROUND ATMOSPHERIC GRADIENTS -->
    <div
      class="absolute inset-0 pointer-events-none transition-all duration-1000"
      :class="backgroundAtmosphereClass"
    ></div>

    <!-- TOP BAR: MATCH STATUS & SPECTATOR CONTROLS -->
    <header
      class="relative z-10 flex justify-between items-center bg-gray-900/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-gray-800 shadow-2xl"
    >
      <div class="flex items-center gap-4 sm:gap-6">
        <div class="flex items-center gap-3">
          <span class="text-3xl sm:text-4xl">🎭</span>
          <div>
            <h1 class="text-xl sm:text-2xl font-black tracking-wider text-white">
              MPGA
              <span class="text-amber-400 font-mono text-sm sm:text-base font-bold">PROJECTOR</span>
            </h1>
            <p class="text-xs text-gray-400 font-medium">
              {{
                isRemoteSpectator ? $t('projector.remoteSpectator') : $t('projector.localDisplay')
              }}
            </p>
          </div>
        </div>

        <div class="h-8 w-px bg-gray-700 hidden sm:block"></div>

        <!-- DAY & PHASE BADGES -->
        <div class="flex items-center gap-2.5">
          <span
            class="bg-amber-950/80 border border-amber-500/50 text-amber-300 font-black px-4 py-1.5 rounded-2xl text-sm sm:text-base font-mono"
          >
            {{ $t('projector.day', { day: currentDay }) }}
          </span>
          <span
            class="font-black px-4 py-1.5 rounded-2xl text-sm sm:text-base uppercase tracking-wider"
            :class="phaseBadgeClass"
          >
            {{ phaseLabel }}
          </span>
        </div>
      </div>

      <!-- SPECTATOR UTILITY CONTROLS -->
      <div class="flex items-center gap-3">
        <!-- Living count -->
        <div
          class="bg-gray-800/90 border border-gray-700 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-bold text-gray-300 flex items-center gap-2"
        >
          <span>👥</span>
          <span>{{ aliveCount }} / {{ totalPlayersCount }} {{ $t('projector.alive') }}</span>
        </div>

        <!-- Fullscreen Button -->
        <button
          class="bg-gray-800 hover:bg-gray-700 active:scale-95 text-white p-2.5 rounded-2xl border border-gray-700 transition-all cursor-pointer"
          :title="$t('projector.fullscreen')"
          @click="toggleFullscreen"
        >
          <span class="text-lg">⛶</span>
        </button>

        <!-- Exit Projector Mode Button -->
        <button
          class="bg-red-950/80 hover:bg-red-900 active:scale-95 text-red-200 px-3.5 py-2 rounded-2xl border border-red-800 text-xs font-bold transition-all cursor-pointer"
          @click="$emit('exit')"
        >
          {{ $t('projector.exitView') }}
        </button>
      </div>
    </header>

    <!-- CENTER HERO STAGE (DYNAMIC BY SUB-PHASE) -->
    <main
      class="relative z-10 flex-1 flex flex-col justify-center items-center my-8 text-center px-4 max-w-5xl mx-auto w-full"
    >
      <!-- 1. DAY PHASE: ACTIVE SPEAKER SPOTLIGHT & TIMER -->
      <div v-if="currentSubPhase === 'day'" class="w-full space-y-8 animate-fade-in">
        <div
          class="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-6 py-2 rounded-full text-sm font-bold tracking-wide uppercase"
        >
          <span>🗣️</span>
          <span>{{ $t('projector.discussionFloor') }}</span>
        </div>

        <!-- Giant Speaker Name -->
        <div>
          <h2
            class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-lg"
          >
            {{ activeSpeakerName || $t('projector.openFloor') }}
          </h2>
          <p
            v-if="isChallengeActive"
            class="text-amber-400 font-bold text-lg sm:text-xl mt-2 animate-pulse"
          >
            ⚡ {{ $t('projector.challengeTurn') }}
          </p>
        </div>

        <!-- Giant Circular or Pill Timer Display -->
        <div class="flex justify-center items-center">
          <div
            class="w-56 h-56 sm:w-72 sm:h-72 rounded-full border-8 flex flex-col justify-center items-center bg-gray-900/90 shadow-2xl transition-all duration-300"
            :class="timerBorderClass"
          >
            <span
              class="text-5xl sm:text-7xl font-black font-mono tracking-tighter"
              :class="timerTextClass"
            >
              {{ formattedTimer }}
            </span>
            <span class="text-xs uppercase font-bold tracking-widest text-gray-400 mt-2">
              {{ $t('projector.secondsRemaining') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. VOTING PHASE: NOMINEES TALLY BOARD -->
      <div v-else-if="currentSubPhase === 'voting'" class="w-full space-y-6 animate-fade-in">
        <div
          class="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-6 py-2 rounded-full text-sm font-bold tracking-wide uppercase"
        >
          <span>🗳️</span>
          <span>{{ $t('projector.votingStage') }}</span>
        </div>

        <h2 class="text-3xl sm:text-5xl font-black text-white">
          {{ $t('projector.nomineesVoteTally') }}
        </h2>

        <!-- Nominees Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full pt-4">
          <div
            v-for="nominee in votingNominees"
            :key="nominee.name"
            class="bg-gray-900/90 border-2 border-orange-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between items-center gap-4"
          >
            <span class="text-xl sm:text-2xl font-black text-white truncate max-w-full">
              {{ nominee.name }}
            </span>

            <!-- Vote Counter -->
            <div class="flex items-center gap-3">
              <span class="text-4xl sm:text-5xl font-black text-orange-400 font-mono">
                {{ nominee.votes || 0 }}
              </span>
              <span class="text-xs font-bold text-gray-400 uppercase">
                {{ $t('projector.votes') }}
              </span>
            </div>

            <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                class="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-500"
                :style="{
                  width: `${Math.min(100, ((nominee.votes || 0) / Math.max(1, aliveCount)) * 100)}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MIDDAY / DEFENSE PHASE -->
      <div v-else-if="currentSubPhase === 'midday'" class="w-full space-y-6 animate-fade-in">
        <div
          class="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-6 py-2 rounded-full text-sm font-bold tracking-wide uppercase"
        >
          <span>⚖️</span>
          <span>{{ $t('projector.middayCourt') }}</span>
        </div>

        <h2 class="text-3xl sm:text-5xl font-black text-white">
          {{ $t('projector.finalDefenseCourt') }}
        </h2>

        <div
          v-if="eliminatedPlayer"
          class="bg-purple-950/60 border border-purple-500/50 p-6 rounded-3xl max-w-md mx-auto shadow-2xl"
        >
          <p class="text-xs text-purple-300 font-bold uppercase tracking-wider mb-2">
            {{ $t('projector.eliminatedPlayer') }}
          </p>
          <p class="text-3xl font-black text-white">{{ eliminatedPlayer.name }}</p>
        </div>
      </div>

      <!-- 4. NIGHT PHASE: ATMOSPHERIC STEALTH SCENERY -->
      <div v-else-if="currentSubPhase === 'night'" class="w-full space-y-6 animate-fade-in">
        <div class="text-7xl sm:text-8xl animate-pulse my-4">🌙</div>

        <h2 class="text-4xl sm:text-6xl font-black text-indigo-300 tracking-tight">
          {{ $t('projector.townAsleep') }}
        </h2>

        <p class="text-base sm:text-xl text-gray-400 max-w-lg mx-auto font-medium leading-relaxed">
          {{ $t('projector.townAsleepDesc') }}
        </p>

        <div
          class="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 px-5 py-2 rounded-2xl text-xs font-bold shadow-lg"
        >
          <span>🔒</span>
          <span>{{ $t('projector.privacyShieldActive') }}</span>
        </div>
      </div>

      <!-- 5. GAME OVER CONCLUSION -->
      <div v-else-if="isGameOver" class="w-full space-y-6 animate-fade-in">
        <div class="text-7xl sm:text-8xl animate-bounce my-2">
          {{ isTownWin ? '🏆' : isMafiaWin ? '👑' : '⚖️' }}
        </div>

        <h2
          class="text-4xl sm:text-6xl font-black tracking-tight"
          :class="isTownWin ? 'text-blue-400' : isMafiaWin ? 'text-red-400' : 'text-purple-400'"
        >
          {{
            isTownWin
              ? $t('gameOver.townVictoryTitle')
              : isMafiaWin
                ? $t('gameOver.mafiaVictoryTitle')
                : 'Match Concluded'
          }}
        </h2>

        <p class="text-lg text-gray-300 max-w-lg mx-auto">
          {{
            isTownWin
              ? $t('gameOver.townVictorySubtitle')
              : isMafiaWin
                ? $t('gameOver.mafiaVictorySubtitle')
                : ''
          }}
        </p>
      </div>
    </main>

    <!-- FOOTER: SURVIVOR ROSTER STRIP -->
    <footer
      class="relative z-10 bg-gray-900/80 backdrop-blur-md p-4 rounded-3xl border border-gray-800 shadow-2xl"
    >
      <div class="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-thin">
        <div class="flex items-center gap-2 text-xs font-bold text-gray-400 shrink-0">
          <span>🛡️</span>
          <span>{{ $t('projector.roster') }}:</span>
        </div>

        <div class="flex items-center gap-2.5 overflow-x-auto">
          <div
            v-for="p in livePlayersList"
            :key="p.name"
            class="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            :class="
              p.isDead
                ? 'bg-gray-950/80 border-gray-800 text-gray-600 line-through opacity-50'
                : 'bg-gray-800/90 border-gray-700 text-gray-200'
            "
          >
            <span :class="p.isDead ? 'opacity-40' : ''">{{ p.isDead ? '💀' : '👤' }}</span>
            <span>{{ p.name }}</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../../stores/gameStore';
import { useMultiplayer } from '../../services/useMultiplayerService';

defineEmits(['exit']);

const { t } = useI18n();
const store = useGameStore();
const multiplayer = useMultiplayer();

// Determine whether we are receiving state from remote host via clientPublicState or local host
const isRemoteSpectator = computed(() => {
  return (
    multiplayer.isClient.value && !store.livePlayers.length && !!multiplayer.clientPublicState.value
  );
});

const currentSubPhase = computed(() => {
  if (isRemoteSpectator.value) {
    return multiplayer.clientPublicState.value?.subPhase || 'day';
  }
  return store.subPhase;
});

const currentDay = computed(() => {
  if (isRemoteSpectator.value) {
    return multiplayer.clientPublicState.value?.currentDay || 1;
  }
  return store.currentDay;
});

const livePlayersList = computed(() => {
  if (isRemoteSpectator.value) {
    return multiplayer.clientPublicState.value?.livePlayers || [];
  }
  return store.livePlayers;
});

const aliveCount = computed(() => {
  return livePlayersList.value.filter((p) => !p.isDead).length;
});

const totalPlayersCount = computed(() => {
  return livePlayersList.value.length;
});

const eliminatedPlayer = computed(() => {
  return store.eliminatedPlayer;
});

const isGameOver = computed(() => {
  if (isRemoteSpectator.value) {
    return multiplayer.clientPublicState.value?.isGameOver || false;
  }
  return store.isGameOver;
});

const winner = computed(() => {
  if (isRemoteSpectator.value) {
    return multiplayer.clientPublicState.value?.winner || null;
  }
  return store.winner;
});

const isTownWin = computed(() => winner.value === 'town');
const isMafiaWin = computed(() => winner.value === 'mafia');

// Speaker & Timer placeholder for local or remote sync
const activeSpeakerName = ref('');
const isChallengeActive = ref(false);
const remainingSeconds = ref(40);

const formattedTimer = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60);
  const secs = remainingSeconds.value % 60;
  return `${mins > 0 ? mins + ':' : ''}${secs < 10 ? '0' : ''}${secs}`;
});

const timerBorderClass = computed(() => {
  if (remainingSeconds.value <= 5) return 'border-red-500 shadow-red-950/60 animate-pulse';
  if (remainingSeconds.value <= 15) return 'border-amber-500 shadow-amber-950/60';
  return 'border-indigo-500 shadow-indigo-950/60';
});

const timerTextClass = computed(() => {
  if (remainingSeconds.value <= 5) return 'text-red-400';
  if (remainingSeconds.value <= 15) return 'text-amber-400';
  return 'text-white';
});

const phaseLabel = computed(() => {
  switch (currentSubPhase.value) {
    case 'day':
      return t('dayPhase.badge');
    case 'voting':
      return t('votingPhase.badge');
    case 'midday':
      return t('middayPhase.badge');
    case 'night':
      return t('nightPhase.badge');
    default:
      return currentSubPhase.value;
  }
});

const phaseBadgeClass = computed(() => {
  switch (currentSubPhase.value) {
    case 'day':
      return 'bg-amber-950/80 border border-amber-600 text-amber-300';
    case 'voting':
      return 'bg-orange-950/80 border border-orange-600 text-orange-300';
    case 'midday':
      return 'bg-purple-950/80 border border-purple-600 text-purple-300';
    case 'night':
      return 'bg-indigo-950/80 border border-indigo-600 text-indigo-300';
    default:
      return 'bg-gray-800 text-gray-300';
  }
});

const backgroundAtmosphereClass = computed(() => {
  switch (currentSubPhase.value) {
    case 'day':
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-gray-950 to-gray-950';
    case 'voting':
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/30 via-gray-950 to-gray-950';
    case 'midday':
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/30 via-gray-950 to-gray-950';
    case 'night':
      return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-gray-950 to-gray-950';
    default:
      return 'bg-gray-950';
  }
});

const votingNominees = computed(() => {
  return livePlayersList.value
    .filter((p) => !p.isDead)
    .slice(0, 6)
    .map((p) => ({
      name: p.name,
      votes: 0,
    }));
});

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};
</script>
