<template>
  <div
    class="min-h-screen bg-gray-950 text-white font-sans p-4 max-w-md mx-auto flex flex-col justify-between"
  >
    <!-- TOP BAR -->
    <header class="py-3 flex justify-between items-center border-b border-gray-850">
      <div class="flex items-center gap-2">
        <span class="text-xl">🎭</span>
        <span
          class="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500"
        >
          MPGA Player
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="w-2.5 h-2.5 rounded-full"
          :class="{
            'bg-green-500 animate-pulse': multiplayer.isConnected.value,
            'bg-yellow-500': multiplayer.connectionStatus.value === 'connecting',
            'bg-red-500':
              multiplayer.connectionStatus.value === 'error' ||
              multiplayer.connectionStatus.value === 'disconnected',
          }"
        ></span>
        <span class="text-[11px] font-mono font-bold text-gray-400 uppercase">
          {{ multiplayer.connectionStatus.value }}
        </span>
        <button
          v-if="multiplayer.isConnected.value"
          class="text-xs text-gray-500 hover:text-red-400 ml-2"
          @click="handleDisconnect"
        >
          ✕
        </button>
      </div>
    </header>

    <!-- CONTENT BODY -->
    <main class="py-4 space-y-5 flex-1">
      <!-- 1. JOIN ROOM FORM (If disconnected or connecting) -->
      <div
        v-if="!multiplayer.isConnected.value"
        class="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4 my-auto"
      >
        <div class="text-center">
          <div class="text-5xl mb-2">📱</div>
          <h2 class="text-xl font-black text-white">{{ $t('playerClient.joinTitle') }}</h2>
          <p class="text-xs text-gray-400 mt-1">{{ $t('playerClient.joinSubtitle') }}</p>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase">{{
              $t('playerClient.roomCodeLabel')
            }}</label>
            <input
              v-model="inputRoomCode"
              type="text"
              maxlength="6"
              placeholder="e.g. 7842"
              class="w-full bg-gray-800 border border-gray-700 text-white font-mono text-center text-xl font-black py-2.5 rounded-xl uppercase tracking-widest focus:ring-2 focus:ring-amber-500 focus:outline-none mt-1"
            />
          </div>

          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase">{{
              $t('playerClient.playerNameLabel')
            }}</label>
            <input
              v-model="inputPlayerName"
              type="text"
              :placeholder="$t('playerClient.playerNamePlaceholder')"
              class="w-full bg-gray-800 border border-gray-700 text-white text-sm py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none mt-1"
            />
            <p class="text-[10px] text-gray-500 mt-1">
              {{ $t('playerClient.playerNameHelp') }}
            </p>
          </div>

          <p
            v-if="multiplayer.errorMessage.value"
            class="text-xs text-red-400 text-center font-bold"
          >
            {{ multiplayer.errorMessage.value }}
          </p>

          <button
            :disabled="!inputRoomCode.trim() || multiplayer.connectionStatus.value === 'connecting'"
            class="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer"
            @click="handleJoin"
          >
            {{
              multiplayer.connectionStatus.value === 'connecting'
                ? $t('playerClient.connecting')
                : $t('playerClient.joinButton')
            }}
          </button>
        </div>
      </div>

      <!-- 2. CONNECTED BUT NO SEAT CLAIMED YET -->
      <div
        v-else-if="!playerIdentity"
        class="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4"
      >
        <div class="text-center">
          <span class="text-3xl">🪑</span>
          <h3 class="text-lg font-black text-white mt-2">
            {{ $t('playerClient.claimSeatTitle') }}
          </h3>
          <p class="text-xs text-gray-400">{{ $t('playerClient.claimSeatSubtitle') }}</p>
        </div>

        <div v-if="publicState?.allPlayers?.length" class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <button
            v-for="p in publicState.allPlayers"
            :key="p.name"
            class="w-full p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-amber-500 rounded-xl flex items-center justify-between text-left transition-all"
            @click="handleClaimSeat(p.name)"
          >
            <div class="flex items-center gap-2.5">
              <span class="font-mono text-gray-500 text-xs font-bold">#{{ p.seat }}</span>
              <span class="text-white font-bold text-sm">{{ p.name }}</span>
            </div>
            <span class="text-xs text-amber-400 font-semibold"
              >{{ $t('playerClient.imThisPlayer') }} →</span
            >
          </button>
        </div>

        <div v-else class="text-center py-6 text-gray-400 text-xs">
          {{ $t('playerClient.waitingForHostSetup') }}
        </div>
      </div>

      <!-- 3. CONNECTED & SEAT CLAIMED (ACTIVE IN-GAME SCREEN) -->
      <div v-else class="space-y-4">
        <!-- PLAYER HEADER & STATUS -->
        <div
          class="flex items-center justify-between bg-gray-900/80 border border-gray-800 p-3 rounded-xl"
        >
          <div class="flex items-center gap-2.5">
            <RoleAvatar :role="playerIdentity.role" :is-dead="playerIdentity.isDead" size="sm" />
            <div>
              <h3 class="font-black text-white text-sm flex items-center gap-1.5">
                {{ playerIdentity.name }}
                <span v-if="playerIdentity.isDead" class="text-xs text-red-400">💀</span>
              </h3>
              <span
                class="text-[10px] font-bold"
                :class="getSideColorClass(playerIdentity.role?.sideId)"
              >
                {{
                  playerIdentity.isDead
                    ? 'Eliminated'
                    : playerIdentity.role?.sideId?.toUpperCase() || 'TOWN'
                }}
              </span>
            </div>
          </div>

          <div class="flex gap-1">
            <span
              v-if="playerIdentity.isSilenced"
              class="bg-purple-900/60 border border-purple-600 text-purple-200 px-2 py-0.5 rounded text-[10px] font-bold"
            >
              🤫 {{ $t('gameModerator.silencedBadge') }}
            </span>
            <span
              v-if="playerIdentity.warnings > 0"
              class="bg-yellow-900/60 border border-yellow-600 text-yellow-200 px-2 py-0.5 rounded text-[10px] font-bold"
            >
              ⚠️ {{ playerIdentity.warnings }}
            </span>
          </div>
        </div>

        <!-- SECRET ROLE PRIVACY CARD -->
        <div
          class="relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-5 shadow-2xl text-center overflow-hidden"
        >
          <!-- Privacy Blur Shield Overlay -->
          <div
            v-if="!isRoleRevealed"
            class="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-10 cursor-pointer"
            @click="isRoleRevealed = true"
          >
            <span class="text-4xl mb-2">🔒</span>
            <span class="font-black text-white text-sm">{{ $t('playerClient.tapToReveal') }}</span>
            <span class="text-[11px] text-gray-400 mt-0.5">{{
              $t('playerClient.privacyNotice')
            }}</span>
          </div>

          <!-- Revealed Card Content -->
          <div class="space-y-3">
            <div class="flex justify-center mb-1">
              <RoleAvatar :role="playerIdentity.role" :is-dead="playerIdentity.isDead" size="lg" />
            </div>

            <div>
              <span
                class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                :class="getSideBadgeClass(playerIdentity.role?.sideId)"
              >
                {{ playerIdentity.role?.sideId || 'Town' }}
              </span>
              <h2 class="text-2xl font-black text-white mt-1.5">
                {{ playerIdentity.role?.name || 'Citizen' }}
              </h2>
              <p class="text-xs text-gray-300 max-w-xs mx-auto mt-1 leading-relaxed">
                {{
                  playerIdentity.role?.description ||
                  'Support town members in identifying the mafia infiltrators.'
                }}
              </p>
            </div>

            <button
              class="text-[11px] text-gray-400 hover:text-white bg-gray-800 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              @click="isRoleRevealed = false"
            >
              🔒 {{ $t('playerClient.hideCard') }}
            </button>
          </div>
        </div>

        <!-- LIVE PHASE FEED -->
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
          <p class="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
            {{ $t('playerClient.currentPhase') }}
          </p>
          <div class="font-black text-base text-white flex items-center justify-center gap-2">
            <span>{{ getPhaseIcon(publicState?.subPhase) }}</span>
            <span class="capitalize"
              >{{ publicState?.subPhase || 'Day' }} Phase (Day
              {{ publicState?.currentDay || 1 }})</span
            >
          </div>
        </div>

        <!-- NIGHT ACTION CONSOLE (If Night & Player is Alive & Role has abilities) -->
        <div
          v-if="
            publicState?.subPhase === 'night' &&
            !playerIdentity.isDead &&
            playerIdentity.role?.sideId !== 'citizen'
          "
          class="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-xl space-y-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-xl">🌙</span>
            <div>
              <h4 class="text-xs font-black text-indigo-300 uppercase tracking-wider">
                {{ $t('playerClient.nightActionPrompt') }}
              </h4>
              <p class="text-[11px] text-gray-300">{{ $t('playerClient.chooseTargetPrompt') }}</p>
            </div>
          </div>

          <!-- Living Targets Dropdown/Grid -->
          <div class="space-y-2">
            <select
              v-model="selectedNightTarget"
              class="w-full bg-gray-900 border border-indigo-500/50 text-white text-xs p-2.5 rounded-lg focus:outline-none"
            >
              <option value="" disabled>{{ $t('playerClient.selectPlayerOption') }}</option>
              <option v-for="target in livingOtherPlayers" :key="target.name" :value="target.name">
                {{ target.name }}
              </option>
            </select>

            <button
              :disabled="!selectedNightTarget || submittedNightTarget"
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              @click="handleNightActionSubmit"
            >
              {{
                submittedNightTarget
                  ? $t('playerClient.actionSubmitted')
                  : $t('playerClient.submitAction')
              }}
            </button>
          </div>

          <!-- Instant Detective Result Feedback -->
          <div
            v-if="detectiveResult"
            class="p-3 rounded-lg border text-center font-bold text-xs"
            :class="
              detectiveResult === 'mafia'
                ? 'bg-red-950/80 border-red-500 text-red-200'
                : 'bg-blue-950/80 border-blue-500 text-blue-200'
            "
          >
            <span class="text-2xl block mb-1">{{ detectiveResult === 'mafia' ? '👎' : '👍' }}</span>
            <span>{{ detectiveResult === 'mafia' ? 'Guilty Mafia' : 'Innocent Town' }}</span>
          </div>
        </div>

        <!-- VOTING BALLOT (If Voting Phase is Active) -->
        <div
          v-if="publicState?.subPhase === 'voting' && !playerIdentity.isDead"
          class="bg-orange-950/30 border border-orange-500/40 p-4 rounded-xl space-y-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-xl">⚖️</span>
            <div>
              <h4 class="text-xs font-black text-orange-400 uppercase tracking-wider">
                {{ $t('playerClient.votingBallot') }}
              </h4>
              <p class="text-[11px] text-gray-300">{{ $t('playerClient.castYourVote') }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="target in livingOtherPlayers"
              :key="target.name"
              class="p-2.5 bg-gray-900 hover:bg-orange-900/50 border border-gray-700 hover:border-orange-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between"
              @click="handleCastVote(target.name)"
            >
              <span class="truncate">{{ target.name }}</span>
              <span class="text-orange-400">🗳️</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="py-2 text-center text-[10px] text-gray-600">
      Mafia Party Game Assistant · P2P WebRTC Mobile Client
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import RoleAvatar from '../RoleAvatar.vue';
import { useMultiplayer } from '../../services/useMultiplayerService';

const multiplayer = useMultiplayer();

const inputRoomCode = ref('');
const inputPlayerName = ref('');
const isRoleRevealed = ref(false);
const selectedNightTarget = ref('');
const submittedNightTarget = ref(false);
const detectiveResult = ref(null);

const playerIdentity = computed(() => multiplayer.clientPlayerIdentity.value);
const publicState = computed(() => multiplayer.clientPublicState.value);

const livingOtherPlayers = computed(() => {
  if (!publicState.value?.livingPlayers) return [];
  return publicState.value.livingPlayers.filter((p) => p.name !== playerIdentity.value?.name);
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join') || urlParams.get('room');
    if (joinCode) {
      inputRoomCode.value = joinCode.toUpperCase();
      const savedName = localStorage.getItem('mpga_player_name') || '';
      if (savedName) {
        inputPlayerName.value = savedName;
      }
      multiplayer.joinRoom(joinCode, savedName);
    }
  }
});

const handleJoin = () => {
  if (!inputRoomCode.value.trim()) return;
  multiplayer.joinRoom(inputRoomCode.value, inputPlayerName.value.trim());
};

const handleClaimSeat = (name) => {
  multiplayer.claimSeat(name);
};

const handleDisconnect = () => {
  multiplayer.disconnect();
};

const handleNightActionSubmit = () => {
  if (!selectedNightTarget.value) return;
  multiplayer.sendNightAction(selectedNightTarget.value);
  submittedNightTarget.value = true;

  // If player is Detective, show simulation result
  if (
    playerIdentity.value?.role?.id === 'detective' ||
    playerIdentity.value?.role?.name?.toLowerCase().includes('detective')
  ) {
    // Detective inquiries are calculated by host or simulated
    detectiveResult.value = 'town';
  }
};

const handleCastVote = (candidateName) => {
  multiplayer.sendVote(candidateName);
};

const getSideColorClass = (sideId) => {
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-town';
};

const getSideBadgeClass = (sideId) => {
  if (sideId === 'mafia') return 'bg-red-950 border border-red-500 text-red-300';
  if (sideId === 'third-party') return 'bg-purple-950 border border-purple-500 text-purple-300';
  return 'bg-blue-950 border border-blue-500 text-blue-300';
};

const getPhaseIcon = (subPhase) => {
  if (subPhase === 'day') return '☀️';
  if (subPhase === 'voting') return '⚖️';
  if (subPhase === 'midday') return '⏳';
  if (subPhase === 'night') return '🌙';
  return '🎮';
};
</script>
