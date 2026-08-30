<template>
  <!-- BIG-SCREEN PROJECTOR / TV VIEW -->
  <div v-if="isProjectorMode" class="min-h-screen bg-gray-950">
    <ProjectorView @exit="isProjectorMode = false" />
  </div>

  <!-- PLAYER MOBILE CLIENT VIEW -->
  <div v-else-if="isPlayerMode" class="min-h-screen bg-gray-950">
    <PlayerClient @return-to-moderator="isPlayerMode = false" />
  </div>

  <!-- MODERATOR HOST VIEW -->
  <div v-else class="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6">
    <header class="mb-8 relative flex flex-col items-center">
      <!-- TOP ACTION BAR -->
      <div class="w-full flex justify-between items-center mb-4 gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- LANGUAGE SWITCHER -->
          <LanguageSwitcher />

          <!-- SOUND FX TOGGLE BUTTON -->
          <button
            class="p-2 sm:px-3 sm:py-1.5 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-700 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="audio.isMuted.value ? $t('audio.unmute') : $t('audio.mute')"
            @click="audio.toggleMute"
          >
            <span>{{ audio.isMuted.value ? '🔇' : '🔊' }}</span>
            <span class="hidden sm:inline">{{
              audio.isMuted.value ? $t('audio.unmute') : $t('audio.soundOn')
            }}</span>
          </button>

          <!-- SOUNDTRACK MUSIC CONSOLE BUTTON -->
          <button
            class="p-2 sm:px-3 sm:py-1.5 bg-gray-800 hover:bg-purple-950/80 active:scale-95 border border-gray-700 hover:border-purple-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('audio.musicConsole')"
            @click="showSoundtrackModal = true"
          >
            <span :class="{ 'animate-pulse text-purple-400': audio.isPlayingMusic.value }">🎵</span>
            <span class="hidden sm:inline max-w-[140px] truncate">
              {{ audio.isPlayingMusic.value ? audio.currentTrack.value?.title || $t('audio.musicConsole') : $t('audio.musicConsole') }}
            </span>
          </button>

          <!-- PROJECTOR TV MODE BUTTON -->
          <button
            class="p-2 sm:px-3 sm:py-1.5 bg-gray-800 hover:bg-indigo-950/80 active:scale-95 border border-gray-700 hover:border-indigo-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('projector.openProjectorScreen')"
            @click="isProjectorMode = true"
          >
            <span>📺</span>
            <span class="hidden sm:inline">{{ $t('projector.projectorView') }}</span>
          </button>

          <!-- IN-GAME GUIDE & ROLE HIERARCHY BUTTON -->
          <button
            class="p-2 sm:px-3 sm:py-1.5 bg-gray-800 hover:bg-amber-950/80 active:scale-95 border border-gray-700 hover:border-amber-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('app.gameGuide')"
            @click="showGuideModal = true"
          >
            <span>📖</span>
            <span class="hidden sm:inline">{{ $t('app.gameGuide') }}</span>
          </button>
        </div>

        <!-- MULTIPLAYER CONNECT PHONES & START OVER -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <button
            class="px-2.5 py-2 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 border border-blue-500/50 text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            :title="$t('multiplayer.connectDevices')"
            @click="openMultiplayerModal"
          >
            <span>📱</span>
            <span class="hidden sm:inline">{{ $t('multiplayer.connectDevices') }}</span>
            <span
              v-if="multiplayer.connectedPeers.value.length > 0"
              class="bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded-full text-[10px]"
            >
              {{ multiplayer.connectedPeers.value.length }}
            </span>
          </button>

          <!-- GLOBAL START OVER BUTTON -->
          <button
            v-if="store.gamePhase !== 'mode-selection'"
            class="p-2 sm:px-3 sm:py-1.5 bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('app.startOver')"
            @click="showResetModal = true"
          >
            <span>↺</span>
            <span class="hidden sm:inline">{{ $t('app.startOver') }}</span>
          </button>
        </div>
      </div>

      <!-- HERO HEADER -->
      <div class="relative text-center max-w-2xl mx-auto space-y-2.5">
        <!-- Sleek Tournament Cockpit Badge with MPGA Logo -->
        <div
          class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-950/40 border border-red-500/30 rounded-full text-[11px] font-semibold text-red-300 tracking-wider uppercase backdrop-blur-md shadow-sm"
        >
          <span class="w-4 h-4 inline-block" v-html="mpgaLogo"></span>
          <span>{{ $t('app.badge') }}</span>
        </div>

        <!-- Sleek Gradient Title -->
        <h1
          class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md"
        >
          <span
            class="bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 bg-clip-text text-transparent"
          >
            {{ $t('app.title') }}
          </span>
        </h1>

        <!-- Refined Subtitle -->
        <p class="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          {{ $t('app.subtitle') }}
        </p>
      </div>
    </header>

    <main class="container mx-auto pb-20">
      <!-- MODE SELECTION PHASE -->
      <ModeSelection
        v-if="store.gamePhase === 'mode-selection'"
        @mode-selected="handleModeSelected"
      />

      <!-- SETUP PHASE -->
      <PlayerEntry
        v-else-if="store.gamePhase === 'setup'"
        :min-players="store.gameMode?.minPlayers || 4"
        @players-ready="handlePlayersReady"
      />

      <!-- ROLE SELECTION PHASE -->
      <RoleSelection
        v-else-if="store.gamePhase === 'role-selection'"
        :player-count="store.players.length"
        @roles-confirmed="handleRolesConfirmed"
      />

      <!-- PLAYING PHASE -->
      <GameModerator v-else-if="store.gamePhase === 'playing'" />
    </main>

    <footer
      class="mt-12 pb-6 border-t border-gray-800/80 pt-6 max-w-2xl mx-auto text-center space-y-2"
    >
      <div
        class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-gray-400"
      >
        <span class="inline-flex items-center gap-1.5">
          <span>{{ $t('app.createdBy') }}</span>
          <span class="font-bold text-gray-200">{{ $t('app.authorName') }}</span>
        </span>
        <span class="text-gray-600">•</span>
        <span
          class="px-2 py-0.5 bg-gray-800 border border-gray-700/80 rounded-full text-[11px] font-mono font-bold text-gray-300 shadow-sm"
        >
          v{{ appVersion }}
        </span>
        <span class="text-gray-600">•</span>
        <button
          class="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-medium transition-colors"
          @click="isPlayerMode = true"
        >
          {{ $t('app.switchToPlayerView') }}
        </button>
      </div>
      <p class="text-[11px] text-gray-400">
        {{ $t('app.copyright') }}
      </p>
    </footer>

    <!-- GLOBAL RESET MODAL -->
    <BaseModal
      :is-open="showResetModal"
      :title="$t('app.startOverConfirmTitle')"
      @close="showResetModal = false"
    >
      <div class="text-center space-y-4 py-2">
        <div class="text-red-500 text-5xl mb-2">⚠️</div>
        <p class="text-lg">{{ $t('app.startOverWarning') }}</p>
        <p class="text-sm text-gray-400">{{ $t('app.startOverSubWarning') }}</p>
      </div>

      <template #footer>
        <button
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          @click="showResetModal = false"
        >
          {{ $t('app.cancel') }}
        </button>
        <button
          class="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
          @click="confirmResetGame"
        >
          {{ $t('app.confirmStartOver') }}
        </button>
      </template>
    </BaseModal>

    <!-- MULTIPLAYER HOST MODAL -->
    <MultiplayerHostModal :is-open="showMultiplayerModal" @close="showMultiplayerModal = false" />

    <!-- SOUNDTRACK CONSOLE MODAL -->
    <SoundtrackConsole :is-open="showSoundtrackModal" @close="showSoundtrackModal = false" />

    <!-- IN-GAME GUIDE & ROLE HIERARCHY MODAL -->
    <GameGuideModal :is-open="showGuideModal" @close="showGuideModal = false" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useGameStore } from './stores/gameStore';
import { useAudio } from './services/useAudioService';
import { useMultiplayer } from './services/useMultiplayerService';
import { saveEncoded } from './utils/storage';
import ModeSelection from './components/ModeSelection.vue';
import PlayerEntry from './components/PlayerEntry.vue';
import RoleSelection from './components/RoleSelection.vue';
import GameModerator from './components/GameModerator.vue';
import BaseModal from './components/BaseModal.vue';
import MultiplayerHostModal from './components/multiplayer/MultiplayerHostModal.vue';
import PlayerClient from './components/player/PlayerClient.vue';
import ProjectorView from './components/projector/ProjectorView.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import SoundtrackConsole from './components/SoundtrackConsole.vue';
import GameGuideModal from './components/GameGuideModal.vue';
import { evaluateGameStatus } from './services/useWinCondition';
import { getMpgaLogo } from './data/modeIllustrations';

const store = useGameStore();
const audio = useAudio();
const multiplayer = useMultiplayer();
const appVersion = __APP_VERSION__;
const mpgaLogo = getMpgaLogo();

// Detection for projector & player client view
const isProjectorMode = ref(false);
const isPlayerMode = ref(false);
const showMultiplayerModal = ref(false);
const showResetModal = ref(false);
const showSoundtrackModal = ref(false);
const showGuideModal = ref(false);

// Auto-DJ watcher for phase transitions
watch(
  [() => store.gamePhase, () => store.subPhase, () => store.isGameOver, () => store.winner],
  ([newPhase, newSubPhase, isGameOver, winner]) => {
    if (!audio.autoPlayOnPhaseChange.value || audio.isMuted.value) return;

    if (isGameOver || newPhase === 'game-over') {
      const evaluation = evaluateGameStatus(store.livePlayers, store.gameLogs, store.nostradamusChoice);
      audio.playVictoryMusic(winner || evaluation.winner || 'town');
    } else if (newPhase === 'playing' || newPhase === 'moderator') {
      if (newSubPhase === 'day') {
        audio.playPhaseMusic('day');
      } else if (newSubPhase === 'voting') {
        audio.playPhaseMusic('voting');
      } else if (newSubPhase === 'midday') {
        audio.playPhaseMusic('midday');
      } else if (newSubPhase === 'night') {
        audio.playPhaseMusic('night');
      }
    } else {
      // The whole time during setup and pre-game windows is treated continuously as the Lobby theme
      audio.playPhaseMusic('lobby');
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Unlock and trigger continuous lobby playback upon first user interaction (browser autoplay policy requirement)
    const handleFirstInteraction = () => {
      if (audio.autoPlayOnPhaseChange.value && !audio.isMuted.value && !audio.isPlayingMusic.value) {
        if (store.isGameOver) {
          audio.playVictoryMusic(store.winner || 'town');
        } else if (store.gamePhase === 'playing' || store.gamePhase === 'moderator') {
          audio.playPhaseMusic(store.subPhase || 'day');
        } else {
          audio.playPhaseMusic('lobby');
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'projector') {
      isProjectorMode.value = true;
    } else if (params.has('join') || params.has('room') || params.has('player')) {
      isPlayerMode.value = true;
    } else {
      // Auto-start host listener so host is always ready for mobile scans
      multiplayer.startHost();
    }
  }

  // Setup multiplayer listener for host
  multiplayer.onPlayerAction((actionData) => {
    if (actionData.action === 'JOIN_LOBBY') {
      if (store.gamePhase === 'setup') {
        store.addSetupPlayer(actionData.playerName, actionData.peerId);
      }
      multiplayer.broadcastHostState(store);
    } else if (
      actionData.action === 'CLAIM_SEAT' ||
      actionData.action === 'PEER_CONNECTED' ||
      actionData.action === 'PEER_DISCONNECTED' ||
      actionData.action === 'PEERS_UPDATED' ||
      actionData.action === 'CLIENT_REQUESTED_STATE'
    ) {
      multiplayer.broadcastHostState(store);
    } else if (actionData.type === 'NIGHT_ACTION' || actionData.action === 'NIGHT_ACTION') {
      store.addLog(
        'night',
        `📱 Mobile Action: ${actionData.actorRole || 'Player'} (${actionData.actorName || actionData.actor})`,
        `Submitted target: ${actionData.targetPlayerName || actionData.target} via mobile phone.`,
        { player: actionData.actorName || actionData.actor, target: actionData.targetPlayerName || actionData.target }
      );
    } else if (actionData.type === 'CAST_VOTE' || actionData.action === 'CAST_VOTE') {
      store.addLog(
        'voting',
        `📱 Mobile Vote: ${actionData.voterName}`,
        `Cast vote for candidate: ${actionData.candidateName}.`,
        { voter: actionData.voterName, candidate: actionData.candidateName }
      );
    }
  });
});

// Setup Pinia subscriptions to automatically save state & broadcast to peers
store.$subscribe((mutation, state) => {
  saveEncoded('mpga_gamePhase', state.gamePhase);
  saveEncoded('mpga_gameMode', state.gameMode);
  saveEncoded('mpga_gamePlayers', state.players);
  saveEncoded('mpga_livePlayers', state.livePlayers);
  saveEncoded('mpga_subPhase', state.subPhase);
  saveEncoded('mpga_currentDay', state.currentDay);
  saveEncoded('mpga_gameLogs', state.gameLogs);
  saveEncoded('mpga_lastWordDeck', state.lastWordDeck);
  saveEncoded('mpga_drawnLastWordCards', state.drawnLastWordCards);
  saveEncoded('mpga_eliminatedPlayer', state.eliminatedPlayer);
  saveEncoded('mpga_isGameOver', state.isGameOver);
  saveEncoded('mpga_winner', state.winner);
  saveEncoded('mpga_nostradamusChoice', state.nostradamusChoice);

  // Live broadcast to connected mobile players
  if (multiplayer.isHost.value) {
    multiplayer.broadcastHostState(state);
  }
});

const openMultiplayerModal = () => {
  if (!multiplayer.isHost.value) {
    multiplayer.startHost();
  }
  showMultiplayerModal.value = true;
};

const handleModeSelected = (mode) => {
  store.setGameMode(mode);
};

const handlePlayersReady = (playersArray) => {
  store.setPlayers(playersArray);
};

const handleRolesConfirmed = (selectedRoles) => {
  const shuffledRoles = [...selectedRoles].sort(() => Math.random() - 0.5);
  const playersWithRoles = store.players.map((player, index) => {
    return {
      ...player,
      role: shuffledRoles[index],
    };
  });
  store.startPlaying(playersWithRoles);
};

const confirmResetGame = () => {
  store.resetGame();
  showResetModal.value = false;
};
</script>
