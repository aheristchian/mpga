<template>
  <div
    class="min-h-screen bg-gray-950 text-white font-sans p-4 max-w-md mx-auto flex flex-col justify-between"
  >
    <!-- TOP BAR -->
    <header class="py-3 flex justify-between items-center border-b border-gray-850 gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xl">🎭</span>
        <span
          class="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500"
        >
          MPGA
        </span>
      </div>

      <div class="flex items-center gap-2">
        <LanguageSwitcher />

        <div class="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1 rounded-xl border border-gray-800 text-[10px]">
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500 animate-pulse': multiplayer.isConnected.value,
              'bg-yellow-500': multiplayer.connectionStatus.value === 'connecting',
              'bg-red-500':
                multiplayer.connectionStatus.value === 'error' ||
                multiplayer.connectionStatus.value === 'disconnected',
            }"
          ></span>
          <span class="font-mono font-bold text-gray-300 uppercase">
            {{ multiplayer.transportMode.value === 'cloud' ? '☁️ Cloud' : '⚡ P2P' }}
          </span>
          <span
            v-if="multiplayer.isConnected.value && multiplayer.pingLatency.value !== null"
            class="text-[9px] font-mono text-gray-400 border-l border-gray-700 pl-1.5"
          >
            {{ multiplayer.pingLatency.value }}ms
          </span>
        </div>

        <!-- RETURN TO MODERATOR BUTTON -->
        <button
          type="button"
          class="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-750 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          :title="$t('playerClient.returnToModerator')"
          @click="emit('returnToModerator')"
        >
          <span>👑</span>
          <span class="hidden sm:inline">{{ $t('playerClient.returnToModerator') }}</span>
        </button>

        <button
          v-if="multiplayer.isConnected.value"
          class="text-xs text-gray-500 hover:text-red-400 p-1 active:scale-95 cursor-pointer"
          :title="$t('playerClient.leaveRoom')"
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

        <!-- Scanned Room Banner -->
        <div
          v-if="inputRoomCode"
          class="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-center"
        >
          <p class="text-xs text-amber-300 font-bold">
            {{ $t('playerClient.scannedRoomPrompt', { code: inputRoomCode }) }}
          </p>
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
              ref="nameInputRef"
              v-model="inputPlayerName"
              type="text"
              autofocus
              :placeholder="$t('playerClient.playerNamePlaceholder')"
              class="w-full bg-gray-800 border border-gray-700 text-white text-sm py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none mt-1"
              @keyup.enter="handleJoin"
            />
            <p class="text-[10px] text-gray-500 mt-1">
              {{ $t('playerClient.playerNameHelp') }}
            </p>
          </div>

          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase">{{
              $t('playerClient.transportLabel')
            }}</label>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                class="py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none text-center"
                :class="
                  multiplayer.transportMode.value === 'cloud'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                "
                @click="multiplayer.setTransportMode('cloud')"
              >
                {{ $t('playerClient.cloudMode') }}
              </button>
              <button
                type="button"
                class="py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none text-center"
                :class="
                  multiplayer.transportMode.value === 'webrtc'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                "
                @click="multiplayer.setTransportMode('webrtc')"
              >
                {{ $t('playerClient.p2pMode') }}
              </button>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase">{{
              $t('playerClient.passcodeLabel')
            }}</label>
            <input
              v-model="inputPasscode"
              type="text"
              maxlength="8"
              :placeholder="$t('playerClient.passcodePlaceholder')"
              class="w-full bg-gray-800 border border-gray-700 text-white text-sm font-mono py-2.5 px-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none mt-1"
            />
          </div>

          <div
            v-if="multiplayer.errorMessage.value"
            class="bg-red-950/60 border border-red-800 p-3 rounded-xl space-y-2 text-center"
          >
            <p class="text-xs text-red-300 font-bold">
              {{
                multiplayer.errorMessage.value === 'WRONG_PASSCODE'
                  ? $t('playerClient.wrongPasscode')
                  : multiplayer.errorMessage.value
              }}
            </p>
            <button
              class="px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              @click="handleJoin"
            >
              🔄 {{ $t('playerClient.retryButton') }}
            </button>
          </div>

          <button
            v-if="multiplayer.connectionStatus.value !== 'error'"
            :disabled="!inputRoomCode.trim() || multiplayer.connectionStatus.value === 'connecting'"
            class="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            @click="handleJoin"
          >
            <span
              v-if="multiplayer.connectionStatus.value === 'connecting'"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            <span>{{
              multiplayer.connectionStatus.value === 'connecting'
                ? $t('playerClient.connecting')
                : $t('playerClient.joinButton')
            }}</span>
          </button>
        </div>
      </div>

      <!-- 2. CONNECTED: LOBBY WAITING SCREEN (Setup phase or waiting for role assignment) -->
      <div
        v-else-if="!playerIdentity?.role"
        class="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl space-y-4"
      >
        <div class="text-center space-y-1.5">
          <div class="inline-block p-2.5 bg-blue-950/80 border border-blue-500/50 rounded-2xl">
            <span class="text-2xl">🎉</span>
          </div>
          <h3 class="text-lg font-black text-white">
            {{ $t('playerClient.inLobbyTitle') }}
          </h3>
          <p class="text-xs text-blue-400 font-medium">
            {{
              $t('playerClient.inLobbySubtitle', {
                code: multiplayer.roomCode.value,
                name: effectivePlayerName || 'Player',
              })
            }}
          </p>
        </div>

        <!-- 2A. UNNAMED PLAYER PROMPT (If connected without a name) -->
        <div
          v-if="!effectivePlayerName"
          class="p-4 bg-amber-950/40 border border-amber-500/60 rounded-2xl space-y-2.5"
        >
          <div class="flex items-center gap-2">
            <span class="text-xl">✍️</span>
            <div>
              <h4 class="text-xs font-bold text-amber-300">
                {{ $t('playerClient.enterNameToJoinPrompt') }}
              </h4>
              <p class="text-[10px] text-gray-400">{{ $t('playerClient.playerNameHelp') }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="lobbyNameInput"
              type="text"
              :placeholder="$t('playerClient.playerNamePlaceholder')"
              class="flex-1 bg-gray-800 border border-gray-700 text-white text-xs py-2 px-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              @keyup.enter="submitLobbyName"
            />
            <button
              :disabled="!lobbyNameInput.trim()"
              class="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
              @click="submitLobbyName"
            >
              {{ $t('playerClient.addToRoster') }}
            </button>
          </div>
        </div>

        <!-- 2B. REGISTERED PLAYER CARD -->
        <div
          v-else
          class="p-3.5 bg-blue-950/30 border border-blue-500/40 rounded-2xl space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">👤</span>
              <div>
                <p class="text-[10px] uppercase font-bold text-blue-400">
                  {{ $t('playerClient.registeredAs') }}
                </p>
                <h4 class="text-sm font-black text-white">{{ effectivePlayerName }}</h4>
              </div>
            </div>
            <button
              class="text-xs bg-gray-800 hover:bg-gray-700 text-blue-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              @click="toggleEditName"
            >
              {{ isEditingName ? $t('app.cancel') : '✏️ ' + $t('playerClient.changeName') }}
            </button>
          </div>

          <!-- Inline Edit Input -->
          <div v-if="isEditingName" class="flex gap-2 pt-1">
            <input
              v-model="lobbyNameInput"
              type="text"
              :placeholder="$t('playerClient.playerNamePlaceholder')"
              class="flex-1 bg-gray-800 border border-gray-700 text-white text-xs py-1.5 px-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              @keyup.enter="submitLobbyName"
            />
            <button
              :disabled="!lobbyNameInput.trim()"
              class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg cursor-pointer transition-all"
              @click="submitLobbyName"
            >
              {{ $t('playerEntry.save') }}
            </button>
          </div>
        </div>

        <!-- STATUS NOTICE -->
        <div class="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
          <p class="text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 text-center">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{{ $t('playerClient.waitingForHostToStart') }}</span>
          </p>
        </div>

        <!-- LOBBY ROSTER LIST -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {{ $t('playerClient.lobbyPlayersList', { count: lobbyPlayersList.length }) }}
            </h4>
            <span class="text-[10px] text-gray-500 font-medium flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Live</span>
            </span>
          </div>

          <div
            v-if="lobbyPlayersList.length > 0"
            class="space-y-1.5 max-h-56 overflow-y-auto pr-1"
          >
            <div
              v-for="p in lobbyPlayersList"
              :key="p.name"
              class="p-2.5 bg-gray-800 rounded-xl flex items-center justify-between border"
              :class="
                p.name.toLowerCase() === effectivePlayerName.toLowerCase()
                  ? 'border-blue-500 bg-blue-950/40 font-bold text-white shadow'
                  : 'border-gray-700 text-gray-300'
              "
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-gray-500">#{{ p.seat }}</span>
                <span class="text-sm">{{ p.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="p.name.toLowerCase() === effectivePlayerName.toLowerCase()"
                  class="text-[10px] bg-blue-900/90 text-blue-300 border border-blue-500/50 px-2 py-0.5 rounded-full font-extrabold tracking-wider"
                >
                  {{ $t('playerClient.youBadge') }}
                </span>
                <button
                  v-else-if="!effectivePlayerName"
                  class="text-[11px] bg-amber-600/80 hover:bg-amber-500 text-white font-medium px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  @click="handleClaimSeat(p.name)"
                >
                  {{ $t('playerClient.imThisPlayer') }} →
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center py-5 bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-3"
          >
            <p class="text-xs text-gray-400">
              {{ $t('playerClient.noPlayersInLobby') }}
            </p>
          </div>
        </div>

        <button
          class="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          @click="handleDisconnect"
        >
          ← {{ $t('playerClient.leaveRoom') }}
        </button>
      </div>

      <!-- 3. CONNECTED & ROLE ASSIGNED (ACTIVE IN-GAME SCREEN) -->
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
                {{ $te('sides.' + playerIdentity.role?.sideId) ? $t('sides.' + playerIdentity.role?.sideId) : (playerIdentity.role?.sideId || 'Town') }}
              </span>
              <h2 class="text-2xl font-black text-white mt-1.5">
                {{ $te('roles.' + playerIdentity.role?.id + '.name') ? $t('roles.' + playerIdentity.role?.id + '.name') : (playerIdentity.role?.name || 'Citizen') }}
              </h2>
              <p class="text-xs text-gray-300 max-w-xs mx-auto mt-1 leading-relaxed">
                {{
                  $te('roles.' + playerIdentity.role?.id + '.description')
                    ? $t('roles.' + playerIdentity.role?.id + '.description')
                    : (playerIdentity.role?.description || 'Support town members in identifying the mafia infiltrators.')
                }}
              </p>
            </div>

            <button
              class="text-[11px] text-gray-300 active:scale-95 hover:text-white bg-gray-800 border border-gray-700 px-4 py-1.5 rounded-lg transition-all cursor-pointer select-none"
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
              class="w-full min-h-[44px] py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 active:brightness-90 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md select-none"
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
            <span class="text-2xl block mb-1">{{ detectiveResult === 'mafia' ? '👍' : '👎' }}</span>
            <span>{{
              detectiveResult === 'mafia'
                ? $t('nightPhase.guiltyMafia')
                : $t('nightPhase.innocentTown')
            }}</span>
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
              class="p-3 min-h-[44px] bg-gray-900 hover:bg-orange-900/50 active:scale-95 active:brightness-90 border border-gray-700 hover:border-orange-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between select-none"
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
    <footer class="py-4 text-center text-xs text-gray-400 space-y-2 border-t border-gray-900/80">
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span class="inline-flex items-center gap-1.5">
          <span>{{ $t('app.createdBy') }}</span>
          <strong class="text-gray-200">{{ $t('app.authorName') }}</strong>
        </span>
        <span class="text-gray-600">•</span>
        <span
          class="px-1.5 py-0.2 bg-gray-900 border border-gray-800 rounded text-[10px] font-mono font-bold text-gray-400"
        >
          v{{ appVersion }}
        </span>
        <span class="text-gray-600">•</span>
        <button
          type="button"
          class="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer font-medium text-xs transition-colors"
          @click="emit('returnToModerator')"
        >
          {{ $t('playerClient.returnToModerator') }}
        </button>
      </div>
      <p class="text-[11px] text-gray-500">
        {{ $t('app.copyright') }}
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import RoleAvatar from '../RoleAvatar.vue';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import { useMultiplayer } from '../../services/useMultiplayerService';

const emit = defineEmits(['returnToModerator']);
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';
const multiplayer = useMultiplayer();

const nameInputRef = ref(null);
const inputRoomCode = ref('');
const inputPlayerName = ref('');
const inputPasscode = ref('');
const lobbyNameInput = ref('');
const isEditingName = ref(false);
const isRoleRevealed = ref(false);
const selectedNightTarget = ref('');
const submittedNightTarget = ref(false);
const detectiveResult = ref(null);

const playerIdentity = computed(() => multiplayer.clientPlayerIdentity.value);
const publicState = computed(() => multiplayer.clientPublicState.value);

const effectivePlayerName = computed(() => {
  return multiplayer.clientPlayerName.value || inputPlayerName.value || '';
});

const lobbyPlayersList = computed(() => {
  if (publicState.value?.allPlayers?.length) return publicState.value.allPlayers;
  if (publicState.value?.setupPlayers?.length) return publicState.value.setupPlayers;
  if (multiplayer.lobbyPlayers.value?.length) return multiplayer.lobbyPlayers.value;
  return [];
});

const livingOtherPlayers = computed(() => {
  if (!publicState.value?.livingPlayers) return [];
  const myRole = playerIdentity.value?.role?.id;
  // Doctor can target themselves; all other roles (Leon, Detective, Godfather, etc.) cannot
  if (myRole === 'doctor') {
    return publicState.value.livingPlayers;
  }
  return publicState.value.livingPlayers.filter((p) => p.name !== playerIdentity.value?.name);
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join') || urlParams.get('room');
    const pin = urlParams.get('pin') || '';
    const transport = urlParams.get('t') || '';

    if (transport === 'cloud' || transport === 'webrtc') {
      multiplayer.setTransportMode(transport);
    }
    if (pin) {
      inputPasscode.value = pin;
    }
    if (joinCode) {
      inputRoomCode.value = joinCode.toUpperCase();
      const savedName = (localStorage.getItem('mpga_player_name') || '').trim();
      if (savedName) {
        inputPlayerName.value = savedName;
        multiplayer.joinRoom(joinCode, savedName, pin, transport || multiplayer.transportMode.value);
      }
    }
  }
});

const handleJoin = () => {
  if (!inputRoomCode.value.trim()) return;
  multiplayer.joinRoom(
    inputRoomCode.value,
    inputPlayerName.value.trim(),
    inputPasscode.value.trim(),
    multiplayer.transportMode.value
  );
};

const submitLobbyName = () => {
  const name = lobbyNameInput.value.trim();
  if (!name) return;
  inputPlayerName.value = name;
  multiplayer.joinLobby(name, inputPasscode.value);
  isEditingName.value = false;
};

const toggleEditName = () => {
  isEditingName.value = !isEditingName.value;
  if (isEditingName.value) {
    lobbyNameInput.value = effectivePlayerName.value;
  }
};

const handleClaimSeat = (name) => {
  inputPlayerName.value = name;
  multiplayer.claimSeat(name);
};

const handleDisconnect = () => {
  multiplayer.disconnect();
};

const handleNightActionSubmit = () => {
  if (!selectedNightTarget.value) return;
  multiplayer.sendNightAction(selectedNightTarget.value);
  submittedNightTarget.value = true;

  // If player is Detective, show inquiry feedback
  if (
    playerIdentity.value?.role?.id === 'detective' ||
    playerIdentity.value?.role?.name?.toLowerCase().includes('detective')
  ) {
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
