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
  <div v-else class="min-h-screen bg-gray-900 text-white font-sans p-3 sm:p-6">
    <header class="mb-6 sm:mb-8 relative flex flex-col items-center">
      <!-- TOP ACTION BAR -->
      <div class="w-full flex justify-between items-center mb-3 sm:mb-4 gap-2">
        <!-- LEFT: LANGUAGE SWITCHER -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
        </div>

        <!-- DESKTOP TOP ACTIONS (hidden on mobile, visible on md:) -->
        <div class="hidden md:flex items-center gap-1.5 sm:gap-2">
          <!-- SOUND FX TOGGLE BUTTON -->
          <button
            class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-700 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="audio.isMuted.value ? $t('audio.unmute') : $t('audio.mute')"
            @click="audio.toggleMute"
          >
            <span>{{ audio.isMuted.value ? '🔇' : '🔊' }}</span>
            <span>{{ audio.isMuted.value ? $t('audio.unmute') : $t('audio.soundOn') }}</span>
          </button>

          <!-- SOUNDTRACK MUSIC CONSOLE BUTTON -->
          <button
            class="px-3 py-1.5 bg-gray-800 hover:bg-purple-950/80 active:scale-95 border border-gray-700 hover:border-purple-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('audio.musicConsole')"
            @click="showSoundtrackModal = true"
          >
            <span :class="{ 'animate-pulse text-purple-400': audio.isPlayingMusic.value }">🎵</span>
            <span class="max-w-[140px] truncate">
              {{
                audio.isPlayingMusic.value
                  ? audio.currentTrack.value?.title || $t('audio.musicConsole')
                  : $t('audio.musicConsole')
              }}
            </span>
          </button>

          <!-- PROJECTOR TV MODE BUTTON -->
          <button
            class="px-3 py-1.5 bg-gray-800 hover:bg-indigo-950/80 active:scale-95 border border-gray-700 hover:border-indigo-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('projector.openProjectorScreen')"
            @click="isProjectorMode = true"
          >
            <span>📺</span>
            <span>{{ $t('projector.projectorView') }}</span>
          </button>

          <!-- IN-GAME GUIDE & ROLE HIERARCHY BUTTON -->
          <button
            class="px-3 py-1.5 bg-gray-800 hover:bg-amber-950/80 active:scale-95 border border-gray-700 hover:border-amber-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('app.gameGuide')"
            @click="showGuideModal = true"
          >
            <span>📖</span>
            <span>{{ $t('app.gameGuide') }}</span>
          </button>

          <!-- IN-BROWSER ROLE STUDIO & GAME PACKS -->
          <button
            class="px-3 py-1.5 bg-gray-800 hover:bg-purple-950/80 active:scale-95 border border-gray-700 hover:border-purple-500/60 text-gray-300 hover:text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('studio.button')"
            @click="showStudioModal = true"
          >
            <span>🎨</span>
            <span>{{ $t('studio.button') }}</span>
          </button>

          <!-- MULTIPLAYER CONNECT PHONES -->
          <button
            class="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 border border-blue-500/50 text-white rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            :title="$t('multiplayer.connectDevices')"
            @click="openMultiplayerModal"
          >
            <span>📱</span>
            <span>{{ $t('multiplayer.connectDevices') }}</span>
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
            class="px-3 py-1.5 bg-gray-800 hover:bg-red-900 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-white rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow shrink-0"
            :title="$t('app.startOver')"
            @click="showResetModal = true"
          >
            <span>↺</span>
            <span>{{ $t('app.startOver') }}</span>
          </button>
        </div>

        <!-- MOBILE COMPACT ACTIONS (< md screens) -->
        <div class="flex md:hidden items-center gap-1.5">
          <!-- QUICK CONNECT DEVICES PILL BUTTON -->
          <button
            class="px-2.5 py-1.5 bg-blue-900/80 hover:bg-blue-800 active:scale-95 border border-blue-500/50 text-blue-200 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 shadow"
            :title="$t('multiplayer.connectDevices')"
            @click="openMultiplayerModal"
          >
            <span>📱</span>
            <span
              v-if="multiplayer.connectedPeers.value.length > 0"
              class="bg-green-500 text-gray-950 font-black px-1.5 py-0.2 rounded-full text-[10px]"
            >
              {{ multiplayer.connectedPeers.value.length }}
            </span>
            <span v-else class="text-[11px]">{{ $t('multiplayer.connectDevicesShort') }}</span>
          </button>

          <!-- HAMBURGER MENU BUTTON -->
          <button
            class="p-2 bg-gray-800 hover:bg-gray-750 active:scale-95 border border-gray-700 text-gray-200 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow shrink-0 min-w-[38px] min-h-[38px] relative"
            :title="$t('app.menu')"
            @click="showMobileMenu = !showMobileMenu"
          >
            <span
              v-if="audio.isPlayingMusic.value"
              class="absolute -top-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"
            ></span>
            <span
              v-if="audio.isPlayingMusic.value"
              class="absolute -top-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-2.5 h-2.5 rounded-full bg-purple-500"
            ></span>
            <span class="text-base leading-none">{{ showMobileMenu ? '✕' : '☰' }}</span>
          </button>
        </div>
      </div>

      <!-- MOBILE MENU DRAWER / MODAL -->
      <Teleport to="body">
        <div
          v-if="showMobileMenu"
          class="fixed inset-0 z-[100] flex flex-col justify-start items-center p-3 sm:p-6"
        >
          <!-- BACKDROP -->
          <div
            class="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            @click="showMobileMenu = false"
          ></div>

          <!-- SLIDE-DOWN DROPDOWN PANEL -->
          <div
            class="relative w-full max-w-sm bg-gray-850 border border-gray-700/80 rounded-2xl shadow-2xl p-4 text-white z-10 space-y-3 mt-1.5 animate-fade-in"
          >
            <!-- HEADER -->
            <div class="flex justify-between items-center pb-2.5 border-b border-gray-700/70">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4 inline-block" v-html="mpgaLogo"></span>
                <h3 class="font-bold text-sm text-gray-200">
                  {{ $t('app.menuTitle') }}
                </h3>
              </div>
              <button
                class="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer text-xs"
                @click="showMobileMenu = false"
              >
                ✕
              </button>
            </div>

            <!-- MENU ITEMS LIST -->
            <div class="space-y-2">
              <!-- 1. SOUND FX TOGGLE -->
              <button
                class="w-full px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                :class="
                  audio.isMuted.value
                    ? 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-750'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                "
                @click="toggleSoundFxFromMenu"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">{{ audio.isMuted.value ? '🔇' : '🔊' }}</span>
                  <span>{{ $t('app.soundEffects') }}</span>
                </div>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  :class="
                    audio.isMuted.value
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  "
                >
                  {{ audio.isMuted.value ? $t('app.soundEffectsMuted') : $t('app.soundEffectsOn') }}
                </span>
              </button>

              <!-- 2. SOUNDTRACK CONSOLE -->
              <button
                class="w-full px-3.5 py-2.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                @click="openSoundtrackFromMenu"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="text-base shrink-0"
                    :class="{ 'animate-pulse text-purple-400': audio.isPlayingMusic.value }"
                    >🎵</span
                  >
                  <div class="flex flex-col items-start min-w-0 text-start">
                    <span class="font-bold">{{ $t('app.musicConsole') }}</span>
                    <span class="text-[10px] text-purple-300/70 truncate max-w-[170px]">
                      {{
                        audio.isPlayingMusic.value
                          ? audio.currentTrack.value?.title || $t('app.musicPlaying', { track: '' })
                          : $t('app.musicStopped')
                      }}
                    </span>
                  </div>
                </div>
                <span
                  v-if="audio.isPlayingMusic.value"
                  class="shrink-0 flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-500/40"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                  <span>{{ $t('audio.autoPlayOn') }}</span>
                </span>
              </button>

              <!-- 3. MULTIPLAYER DEVICES -->
              <button
                class="w-full px-3.5 py-2.5 rounded-xl border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/40 text-blue-200 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                @click="openMultiplayerFromMenu"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">📱</span>
                  <span>{{ $t('multiplayer.connectDevices') }}</span>
                </div>
                <span
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  :class="
                    multiplayer.connectedPeers.value.length > 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  "
                >
                  {{
                    multiplayer.connectedPeers.value.length > 0
                      ? multiplayer.connectedPeers.value.length
                      : $t('multiplayer.offline')
                  }}
                </span>
              </button>

              <!-- 4. PROJECTOR TV VIEW -->
              <button
                class="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-200 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                @click="openProjectorFromMenu"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">📺</span>
                  <span>{{ $t('app.projectorMode') }}</span>
                </div>
                <span class="text-[10px] text-indigo-400 font-bold rtl:rotate-180">↗</span>
              </button>

              <!-- 5. GAME GUIDE & RULES -->
              <button
                class="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/40 text-amber-200 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                @click="openGuideFromMenu"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">📖</span>
                  <span>{{ $t('app.gameGuide') }}</span>
                </div>
                <span class="text-[10px] text-amber-400 font-bold rtl:rotate-180">↗</span>
              </button>

              <!-- 6. ROLE STUDIO & RULES -->
              <button
                class="w-full px-3.5 py-2.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                @click="
                  showMobileMenu = false;
                  showStudioModal = true;
                "
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">🎨</span>
                  <span>{{ $t('studio.button') }}</span>
                </div>
                <span class="text-[10px] text-purple-400 font-bold rtl:rotate-180">↗</span>
              </button>

              <!-- 7. START OVER / RESET -->
              <button
                v-if="store.gamePhase !== 'mode-selection'"
                class="w-full px-3.5 py-2.5 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/40 text-red-300 transition-all text-xs font-semibold flex items-center justify-between cursor-pointer active:scale-98"
                @click="openResetFromMenu"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">↺</span>
                  <span>{{ $t('app.startOver') }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- HERO HEADER -->
      <div class="relative text-center max-w-2xl mx-auto space-y-2 mb-1">
        <!-- Sleek Tournament Cockpit Badge with MPGA Logo -->
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 border border-red-500/30 rounded-full text-[10px] sm:text-[11px] font-semibold text-red-300 tracking-wider uppercase backdrop-blur-md shadow-sm"
        >
          <span class="w-3.5 h-3.5 inline-block" v-html="mpgaLogo"></span>
          <span>{{ $t('app.badge') }}</span>
        </div>

        <!-- Sleek Gradient Title -->
        <h1
          class="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md"
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
        :key="modeSelectionKey"
        @mode-selected="handleModeSelected"
        @open-studio="showStudioModal = true"
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
      <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-gray-400">
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

    <!-- ROLE STUDIO & GAME PACKS MODAL -->
    <RoleStudioModal
      :is-open="showStudioModal"
      @close="showStudioModal = false"
      @pack-updated="handlePackUpdated"
    />
  </div>
</template>

<script setup lang="ts">
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
import RoleStudioModal from './components/studio/RoleStudioModal.vue';
import { evaluateGameStatus } from './services/useWinCondition';
import { getMpgaLogo } from './data/modeIllustrations';
import { fisherYatesShuffle } from './utils/shuffle';

const store = useGameStore();
const audio = useAudio();
const multiplayer = useMultiplayer();
const appVersion = __APP_VERSION__;
const mpgaLogo = getMpgaLogo();

// Detection for projector & player client view
const isProjectorMode = ref(false);
const isPlayerMode = ref(false);
const showMobileMenu = ref(false);
const showMultiplayerModal = ref(false);
const showResetModal = ref(false);
const showSoundtrackModal = ref(false);
const showGuideModal = ref(false);
const showStudioModal = ref(false);
const modeSelectionKey = ref(0);

const handlePackUpdated = () => {
  modeSelectionKey.value++;
};

// Auto-DJ watcher for phase transitions
watch(
  [() => store.gamePhase, () => store.subPhase, () => store.isGameOver, () => store.winner],
  ([newPhase, newSubPhase, isGameOver, winner]) => {
    if (!audio.autoPlayOnPhaseChange.value || audio.isMuted.value) return;

    if (isGameOver || newPhase === 'game-over') {
      const evaluation = evaluateGameStatus(
        store.livePlayers,
        store.gameLogs,
        store.nostradamusChoice
      );
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
      if (
        audio.autoPlayOnPhaseChange.value &&
        !audio.isMuted.value &&
        !audio.isPlayingMusic.value
      ) {
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
        {
          player: actionData.actorName || actionData.actor,
          target: actionData.targetPlayerName || actionData.target,
        }
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
  const shuffledRoles = fisherYatesShuffle(selectedRoles);
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

const toggleSoundFxFromMenu = () => {
  audio.toggleMute();
};

const openSoundtrackFromMenu = () => {
  showMobileMenu.value = false;
  showSoundtrackModal.value = true;
};

const openProjectorFromMenu = () => {
  showMobileMenu.value = false;
  isProjectorMode.value = true;
};

const openGuideFromMenu = () => {
  showMobileMenu.value = false;
  showGuideModal.value = true;
};

const openMultiplayerFromMenu = () => {
  showMobileMenu.value = false;
  openMultiplayerModal();
};

const openResetFromMenu = () => {
  showMobileMenu.value = false;
  showResetModal.value = true;
};
</script>
