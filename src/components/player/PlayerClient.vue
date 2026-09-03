<template>
  <div
    class="min-h-screen font-sans p-4 max-w-md mx-auto flex flex-col justify-between transition-colors duration-500"
    :class="
      publicState?.subPhase === 'night' && isStealthMode
        ? 'bg-black text-neutral-300'
        : 'bg-gray-950 text-white'
    "
  >
    <!-- TOP BAR -->
    <header
      class="py-3 flex justify-between items-center border-b gap-2 transition-colors duration-300"
      :class="
        publicState?.subPhase === 'night' && isStealthMode
          ? 'border-neutral-900'
          : 'border-gray-850'
      "
    >
      <div class="flex items-center gap-2">
        <span class="text-xl">🎭</span>
        <span
          class="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r"
          :class="
            publicState?.subPhase === 'night' && isStealthMode
              ? 'from-red-700 to-red-900'
              : 'from-red-500 to-amber-500'
          "
        >
          MPGA
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- CONNECTION STATUS PILL -->
        <div
          class="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1.5 rounded-xl border border-gray-800 text-[11px]"
        >
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
          <span class="font-mono font-bold text-gray-300 uppercase">
            {{ multiplayer.transportMode.value === 'cloud' ? '☁️' : '⚡' }}
          </span>
          <span
            v-if="multiplayer.isConnected.value && multiplayer.pingLatency.value !== null"
            class="text-[10px] font-mono text-gray-400 border-l rtl:border-l-0 rtl:border-r border-gray-700 px-1"
          >
            {{ multiplayer.pingLatency.value }}ms
          </span>
        </div>

        <!-- HAMBURGER DRAWER BUTTON -->
        <button
          type="button"
          class="min-w-[42px] min-h-[42px] px-2.5 py-1.5 bg-gray-850 hover:bg-gray-800 active:scale-95 border border-gray-700 text-gray-200 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm relative text-base font-bold"
          :title="$t('playerClientDrawer.menuTitle')"
          @click="isDrawerOpen = !isDrawerOpen"
        >
          <span
            v-if="isStealthMode && publicState?.subPhase === 'night'"
            class="absolute -top-0.5 -right-0.5 rtl:-right-auto rtl:-left-0.5 w-2.5 h-2.5 rounded-full bg-red-500"
          ></span>
          <span>{{ isDrawerOpen ? '✕' : '☰' }}</span>
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
                  : multiplayer.errorMessage.value === 'NAME_ALREADY_CLAIMED'
                    ? $t('playerClient.nameAlreadyClaimed')
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
        v-else-if="!playerIdentity?.role || publicState?.gamePhase !== 'playing'"
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

        <!-- ERROR BANNER (e.g. NAME ALREADY CLAIMED) -->
        <div
          v-if="multiplayer.errorMessage.value === 'NAME_ALREADY_CLAIMED'"
          class="p-3 bg-red-950/80 border border-red-500/80 text-red-200 text-xs rounded-xl flex items-center gap-2 shadow-lg"
        >
          <span class="text-base">⚠️</span>
          <span class="font-semibold">{{ $t('playerClient.nameAlreadyClaimed') }}</span>
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
        <div v-else class="p-3.5 bg-blue-950/30 border border-blue-500/40 rounded-2xl space-y-2">
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

        <!-- STATUS NOTICE: NOT STARTED / WAITING -->
        <div
          v-if="publicState?.gamePhase && publicState.gamePhase !== 'playing'"
          class="bg-gradient-to-r from-blue-950/70 to-indigo-950/70 p-3.5 rounded-xl border border-blue-500/40 space-y-1 text-center shadow-inner"
        >
          <p class="text-xs text-blue-300 font-bold flex items-center justify-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>{{ $t('playerClient.gameNotStartedTitle') }}</span>
          </p>
          <p class="text-[11px] text-gray-300 leading-relaxed font-medium">
            {{ $t('playerClient.gameNotStartedNotice') }}
          </p>
          <p class="text-[10px] text-gray-400">
            {{ $t('playerClient.roleWillRevealWhenStarted') }}
          </p>
        </div>
        <div v-else class="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
          <p
            class="text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 text-center"
          >
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

          <div v-if="lobbyPlayersList.length > 0" class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
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
                <span
                  v-else-if="isPlayerClaimed(p.name)"
                  class="text-[10px] bg-gray-900 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                >
                  🔒 {{ $t('playerClient.seatClaimed') }}
                </span>
                <button
                  v-else-if="!effectivePlayerName"
                  class="text-[11px] bg-amber-600/80 hover:bg-amber-500 text-white font-medium px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  @click="handleClaimSeat(p.name)"
                >
                  <span>{{ $t('playerClient.imThisPlayer') }}</span>
                  <span class="inline-block rtl:rotate-180 transform transition-transform">→</span>
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
          class="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          @click="handleDisconnect"
        >
          <span class="inline-block rtl:rotate-180 transform transition-transform">←</span>
          <span>{{ $t('playerClient.leaveRoom') }}</span>
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
                {{
                  $te('sides.' + playerIdentity.role?.sideId)
                    ? $t('sides.' + playerIdentity.role?.sideId)
                    : playerIdentity.role?.sideId || 'Town'
                }}
              </span>
              <h2 class="text-2xl font-black text-white mt-1.5">
                {{
                  $te('roles.' + playerIdentity.role?.id + '.name')
                    ? $t('roles.' + playerIdentity.role?.id + '.name')
                    : playerIdentity.role?.name || 'Citizen'
                }}
              </h2>
              <p class="text-xs text-gray-300 max-w-xs mx-auto mt-1 leading-relaxed">
                {{
                  $te('roles.' + playerIdentity.role?.id + '.description')
                    ? $t('roles.' + playerIdentity.role?.id + '.description')
                    : playerIdentity.role?.description ||
                      'Support town members in identifying the mafia infiltrators.'
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
            playerIdentity.role?.sideId !== 'citizen' &&
            availableNightActions.length > 0
          "
          class="p-4 rounded-xl space-y-4 border transition-colors duration-300"
          :class="
            isStealthMode
              ? 'bg-neutral-950 border-neutral-900 text-neutral-300'
              : 'bg-indigo-950/40 border-indigo-500/40 text-white'
          "
        >
          <div class="flex items-center gap-2">
            <span class="text-xl">🌙</span>
            <div>
              <h4
                class="text-xs font-black uppercase tracking-wider"
                :class="isStealthMode ? 'text-red-400' : 'text-indigo-300'"
              >
                {{ $t('playerClient.nightActionPrompt') }}
              </h4>
              <p class="text-[11px]" :class="isStealthMode ? 'text-neutral-400' : 'text-gray-300'">
                {{ $t('playerClient.chooseTargetPrompt') }}
              </p>
            </div>
          </div>

          <!-- STEP 1: ACTION SELECTION BUTTONS -->
          <div class="space-y-1.5 text-left rtl:text-right">
            <label
              class="text-[10px] font-bold uppercase tracking-wider"
              :class="isStealthMode ? 'text-red-400/90' : 'text-indigo-400'"
            >
              {{ $t('playerClient.step1Action') }}
            </label>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="action in availableNightActions"
                :key="action.id"
                type="button"
                :disabled="submittedNightTarget"
                class="p-3 rounded-xl border text-left rtl:text-right transition-all text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 select-none min-h-[48px]"
                :class="
                  currentActionId === action.id
                    ? isStealthMode
                      ? 'bg-red-950/90 border-red-800 text-red-200 ring-2 ring-red-700 shadow-none'
                      : 'bg-indigo-600 border-indigo-300 text-white shadow-md ring-2 ring-indigo-400'
                    : isStealthMode
                      ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800'
                "
                @click="
                  haptics.vibrateImpact();
                  selectPlayerAction(action.id);
                "
              >
                <span class="text-lg shrink-0">{{ action.icon }}</span>
                <span class="truncate">{{
                  $te(action.nameKey) ? $t(action.nameKey) : action.nameKey
                }}</span>
              </button>
            </div>
          </div>

          <!-- STEP 2: TARGET SELECTION -->
          <div
            v-if="currentActionId === 'pass'"
            class="p-3 border border-dashed rounded-xl text-center"
            :class="
              isStealthMode
                ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400'
                : 'bg-gray-900/80 border-gray-700 text-gray-300'
            "
          >
            <span class="text-xl block">🚫</span>
            <p class="text-xs font-bold mt-1">{{ $t('nightPhase.passNotice') }}</p>
          </div>

          <div
            v-else-if="currentActionId === 'treat-self'"
            class="p-3 border rounded-xl text-center"
            :class="
              isStealthMode
                ? 'bg-red-950/40 border-red-900 text-red-300'
                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
            "
          >
            <span class="text-xl block">🛡️</span>
            <p class="text-xs font-bold mt-1">{{ $t('nightPhase.selfHealNotice') }}</p>
          </div>

          <div v-else class="space-y-1.5 text-left rtl:text-right">
            <div class="flex items-center justify-between">
              <label
                class="text-[10px] font-bold uppercase tracking-wider"
                :class="isStealthMode ? 'text-red-400/90' : 'text-indigo-400'"
              >
                {{ $t('playerClient.step2Target') }}
              </label>
              <span
                v-if="selectedNightTarget"
                class="text-[11px] font-bold"
                :class="isStealthMode ? 'text-red-300' : 'text-indigo-300'"
              >
                {{ selectedNightTarget }}
              </span>
            </div>

            <div
              v-if="validNightTargets.length === 0"
              class="p-3 rounded-lg text-center text-xs"
              :class="
                isStealthMode
                  ? 'bg-neutral-900/60 text-neutral-500'
                  : 'bg-gray-900/60 text-gray-400'
              "
            >
              {{ $t('nightPhase.noDeadPlayers') }}
            </div>

            <div v-else class="grid grid-cols-2 gap-2.5">
              <button
                v-for="target in validNightTargets"
                :key="target.name"
                type="button"
                :disabled="submittedNightTarget"
                class="p-3 rounded-xl border text-left rtl:text-right transition-all text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 select-none min-h-[48px]"
                :class="
                  selectedNightTarget === target.name
                    ? isStealthMode
                      ? 'bg-red-950/90 border-red-800 text-red-200 ring-2 ring-red-700'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-300 text-white shadow-md ring-2 ring-indigo-400'
                    : isStealthMode
                      ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      : 'bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800'
                "
                @click="
                  haptics.vibrateImpact();
                  selectedNightTarget = target.name;
                "
              >
                <span class="truncate flex-1">{{ target.name }}</span>
                <span v-if="selectedNightTarget === target.name" class="text-xs">✓</span>
              </button>
            </div>
          </div>

          <!-- SUBMITTED CONFIRMATION & CHANGE CHOICE -->
          <div
            v-if="submittedNightTarget"
            class="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-left animate-fade-in"
            :class="
              isStealthMode
                ? 'bg-red-950/40 border-red-900/60 text-red-300'
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
            "
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-lg shrink-0">✓</span>
              <div class="min-w-0 flex-1">
                <span class="text-xs font-bold block truncate">{{
                  $t('playerClient.nightTargetSubmitted')
                }}</span>
                <span class="text-[10px] opacity-80 block truncate">
                  {{
                    selectedNightTarget ||
                    (currentActionId === 'pass'
                      ? $t('nightPhase.actionPass')
                      : $t('nightPhase.actionTreatSelf'))
                  }}
                </span>
              </div>
            </div>
            <button
              type="button"
              class="px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all active:scale-95 cursor-pointer select-none shrink-0"
              :class="
                isStealthMode
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-200 hover:text-white'
              "
              @click="submittedNightTarget = false"
            >
              ✏️ {{ $t('playerClient.changeNightTarget') }}
            </button>
          </div>

          <!-- SUBMIT BUTTON (When not yet submitted) -->
          <button
            v-else
            :disabled="
              !selectedNightTarget && currentActionId !== 'pass' && currentActionId !== 'treat-self'
            "
            class="w-full min-h-[44px] py-3 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-lg select-none disabled:opacity-40 active:scale-95"
            :class="
              isStealthMode
                ? 'bg-red-900 hover:bg-red-800 border border-red-700 text-red-100 shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-500'
            "
            @click="handleNightActionSubmit"
          >
            {{ $t('playerClient.submitAction') }}
          </button>

          <!-- Instant Detective Result Feedback -->
          <div
            v-if="detectiveResult"
            class="p-3 rounded-lg border text-center font-bold text-xs"
            :class="
              detectiveResult === 'mafia'
                ? isStealthMode
                  ? 'bg-red-950/90 border-red-700 text-red-200'
                  : 'bg-red-950/80 border-red-500 text-red-200'
                : isStealthMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
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
              <p class="text-[11px] text-gray-300">
                <span v-if="currentVotingStage === 'pre-vote'">
                  {{ $t('playerClient.preVotePrompt') }}
                </span>
                <span v-else-if="currentVotingStage === 'defense'">
                  {{ $t('playerClient.defenseSpeechNotice') }}
                </span>
                <span v-else-if="currentVotingStage === 'final-vote'">
                  {{ $t('playerClient.finalVotePrompt') }}
                </span>
              </p>
            </div>
          </div>

          <!-- STAGE 1: PRE-VOTE -->
          <div v-if="currentVotingStage === 'pre-vote'" class="grid grid-cols-2 gap-2.5">
            <button
              v-for="target in livingOtherPlayers"
              :key="target.name"
              :class="[
                'p-3 min-h-[48px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between select-none active:scale-95 active:brightness-90',
                myPreVotes.includes(target.name)
                  ? 'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/50 ring-2 ring-emerald-500/40'
                  : 'bg-gray-900 border border-gray-700 hover:border-orange-500 text-white hover:bg-orange-950/40',
              ]"
              @click="
                haptics.vibrateImpact();
                handleCastVote(target.name, 'pre');
              "
            >
              <span class="truncate">{{ target.name }}</span>
              <span
                v-if="myPreVotes.includes(target.name)"
                class="text-emerald-400 font-black flex items-center gap-1"
              >
                <span>✓</span>
                <span class="text-[10px] hidden sm:inline">{{
                  $t('playerClient.votedTapToRevoke')
                }}</span>
              </span>
              <span v-else class="text-orange-400">🗳️</span>
            </button>
          </div>

          <!-- STAGE 2: DEFENSE IN PROGRESS -->
          <div
            v-else-if="currentVotingStage === 'defense'"
            class="p-4 bg-gray-900/80 border border-gray-700 rounded-xl text-center space-y-2"
          >
            <span class="text-2xl block animate-pulse">🎙️</span>
            <p class="text-xs text-gray-300 leading-relaxed font-medium">
              {{ $t('playerClient.defenseSpeechNotice') }}
            </p>
          </div>

          <!-- STAGE 3: FINAL VOTE -->
          <div v-else-if="currentVotingStage === 'final-vote'" class="space-y-2">
            <div
              v-if="isMeQualifiedDefender"
              class="p-2.5 bg-yellow-950/60 border border-yellow-600/50 rounded-lg text-xs text-yellow-200 text-center font-medium"
            >
              ⚠️ {{ $t('playerClient.defenderCannotVoteSelf') }}
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="target in qualifiedDefenders"
                :key="target.name"
                :class="[
                  'p-3 min-h-[48px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between select-none active:scale-95 active:brightness-90',
                  myFinalVote === target.name
                    ? 'bg-red-950/90 border-2 border-red-500 text-red-200 shadow-md shadow-red-950/50 ring-2 ring-red-500/50'
                    : 'bg-gray-900 border border-gray-700 hover:border-red-500 text-white hover:bg-red-950/40',
                ]"
                @click="
                  haptics.vibrateImpact();
                  handleCastVote(target.name, 'final');
                "
              >
                <span class="truncate">{{ target.name }}</span>
                <span
                  v-if="myFinalVote === target.name"
                  class="text-red-400 font-black flex items-center gap-1"
                >
                  <span>⚖️</span>
                  <span class="text-[10px] hidden sm:inline">{{
                    $t('playerClient.votedToEliminate')
                  }}</span>
                </span>
                <span v-else class="text-gray-400">🗳️</span>
              </button>
            </div>
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

    <!-- IN-GAME GUIDE & ROLE HIERARCHY MODAL -->
    <GameGuideModal
      :is-open="showGuideModal"
      :is-player-view="true"
      @close="showGuideModal = false"
    />

    <!-- SLIDE-OVER MOBILE DRAWER -->
    <Teleport to="body">
      <div
        v-if="isDrawerOpen"
        class="fixed inset-0 z-[100] flex justify-end"
      >
        <!-- BACKDROP -->
        <div
          class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          @click="isDrawerOpen = false"
        ></div>

        <!-- DRAWER CONTENT -->
        <div
          class="relative w-full max-w-xs sm:max-w-sm bg-gray-900 border-l rtl:border-l-0 rtl:border-r border-gray-800 shadow-2xl p-5 text-white z-10 flex flex-col justify-between overflow-y-auto animate-fade-in"
        >
          <div class="space-y-4">
            <!-- DRAWER HEADER -->
            <div class="flex items-center justify-between pb-3 border-b border-gray-800">
              <div class="flex items-center gap-2">
                <span class="text-xl">🎭</span>
                <h3 class="font-bold text-sm text-gray-200">
                  {{ $t('playerClientDrawer.menuTitle') }}
                </h3>
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer text-xs"
                @click="isDrawerOpen = false"
              >
                ✕
              </button>
            </div>

            <!-- ROOM & NETWORK TELEMETRY -->
            <div class="p-3 bg-gray-850 border border-gray-750 rounded-xl space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400 font-medium">{{ $t('playerClientDrawer.pinCode') }}</span>
                <span class="font-mono font-black text-amber-400 text-sm">
                  {{ multiplayer.roomCode.value || inputRoomCode || '---' }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400 font-medium">{{ $t('multiplayer.transport') }}</span>
                <span class="font-mono text-xs font-bold text-indigo-300">
                  {{ multiplayer.transportMode.value === 'cloud' ? '☁️ Cloud MQTT' : '⚡ WebRTC P2P' }}
                </span>
              </div>
              <div
                v-if="multiplayer.isConnected.value && multiplayer.pingLatency.value !== null"
                class="flex items-center justify-between text-xs"
              >
                <span class="text-gray-400 font-medium">{{ $t('multiplayer.latency') }}</span>
                <span class="font-mono text-xs font-bold text-green-400">
                  {{ multiplayer.pingLatency.value }}ms
                </span>
              </div>
            </div>

            <!-- SETTINGS & CONTROLS -->
            <div class="space-y-2">
              <!-- STEALTH OLED MODE (Available when in night phase or anywhere for night preview) -->
              <button
                type="button"
                class="w-full p-3 rounded-xl border text-left rtl:text-right transition-all flex items-center justify-between cursor-pointer active:scale-98"
                :class="
                  isStealthMode
                    ? 'bg-red-950/60 border-red-700/60 text-red-200 shadow-sm'
                    : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-750'
                "
                @click="isStealthMode = !isStealthMode"
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg">👁️</span>
                  <div>
                    <div class="text-xs font-bold">{{ $t('playerClientDrawer.stealthOled') }}</div>
                    <div class="text-[10px] text-gray-400 leading-tight mt-0.5">
                      {{ $t('playerClientDrawer.stealthOledDesc') }}
                    </div>
                  </div>
                </div>
                <span
                  class="w-9 h-5 rounded-full p-0.5 transition-colors flex items-center shrink-0"
                  :class="isStealthMode ? 'bg-red-600 justify-end' : 'bg-gray-700 justify-start'"
                >
                  <span class="w-4 h-4 rounded-full bg-white block shadow"></span>
                </span>
              </button>

              <!-- SCREEN WAKELOCK -->
              <button
                v-if="wakeLock.isSupported"
                type="button"
                class="w-full p-3 rounded-xl border text-left rtl:text-right transition-all flex items-center justify-between cursor-pointer active:scale-98"
                :class="
                  wakeLock.isActive.value
                    ? 'bg-amber-950/50 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-750'
                "
                @click="wakeLock.toggleWakeLock()"
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg">🔆</span>
                  <div>
                    <div class="text-xs font-bold">{{ $t('playerClientDrawer.wakeLock') }}</div>
                    <div class="text-[10px] text-gray-400 leading-tight mt-0.5">
                      {{ $t('playerClientDrawer.wakeLockDesc') }}
                    </div>
                  </div>
                </div>
                <span
                  class="w-9 h-5 rounded-full p-0.5 transition-colors flex items-center shrink-0"
                  :class="wakeLock.isActive.value ? 'bg-amber-500 justify-end' : 'bg-gray-700 justify-start'"
                >
                  <span class="w-4 h-4 rounded-full bg-white block shadow"></span>
                </span>
              </button>

              <!-- SOUND EFFECTS -->
              <button
                type="button"
                class="w-full p-3 rounded-xl border text-left rtl:text-right transition-all flex items-center justify-between cursor-pointer active:scale-98"
                :class="
                  !audio.isMuted.value
                    ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200 shadow-sm'
                    : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-gray-750'
                "
                @click="audio.toggleMute()"
              >
                <div class="flex items-center gap-3">
                  <span class="text-lg">{{ audio.isMuted.value ? '🔇' : '🔊' }}</span>
                  <div>
                    <div class="text-xs font-bold">{{ $t('playerClientDrawer.soundFx') }}</div>
                    <div class="text-[10px] text-gray-400 leading-tight mt-0.5">
                      {{ audio.isMuted.value ? $t('audio.mute') : $t('audio.soundOn') }}
                    </div>
                  </div>
                </div>
                <span
                  class="w-9 h-5 rounded-full p-0.5 transition-colors flex items-center shrink-0"
                  :class="!audio.isMuted.value ? 'bg-indigo-500 justify-end' : 'bg-gray-700 justify-start'"
                >
                  <span class="w-4 h-4 rounded-full bg-white block shadow"></span>
                </span>
              </button>

              <!-- IN-GAME GUIDE -->
              <button
                type="button"
                class="w-full p-3 bg-gray-850 hover:bg-gray-800 border border-gray-700 text-amber-300 rounded-xl text-left rtl:text-right text-xs font-bold transition-all flex items-center gap-3 cursor-pointer active:scale-98"
                @click="
                  showGuideModal = true;
                  isDrawerOpen = false;
                "
              >
                <span class="text-lg">📖</span>
                <div>
                  <div>{{ $t('playerClientDrawer.inGameGuide') }}</div>
                  <div class="text-[10px] text-gray-400 font-normal leading-tight mt-0.5">
                    {{ $t('app.gameGuide') }}
                  </div>
                </div>
              </button>

              <!-- LANGUAGE SWITCHER -->
              <div class="p-3 bg-gray-850/80 border border-gray-700/80 rounded-xl flex items-center justify-between">
                <span class="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <span>🌐</span>
                  <span>{{ $t('playerClientDrawer.changeLanguage') }}</span>
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="pt-4 border-t border-gray-800 space-y-2">
            <!-- RETURN TO MODERATOR -->
            <button
              type="button"
              class="w-full py-2.5 px-3 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              @click="
                isDrawerOpen = false;
                emit('returnToModerator');
              "
            >
              <span>👑</span>
              <span>{{ $t('playerClientDrawer.returnToModerator') }}</span>
            </button>

            <!-- LEAVE ROOM -->
            <button
              v-if="multiplayer.isConnected.value"
              type="button"
              class="w-full py-2.5 px-3 bg-red-950/40 hover:bg-red-950/70 border border-red-800/50 text-red-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              @click="
                isDrawerOpen = false;
                handleDisconnect();
              "
            >
              <span>✕</span>
              <span>{{ $t('playerClientDrawer.disconnect') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import RoleAvatar from '../RoleAvatar.vue';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import GameGuideModal from '../GameGuideModal.vue';
import { useMultiplayer } from '../../services/useMultiplayerService';
import { useWakeLock } from '../../services/useWakeLock';
import { useHaptics } from '../../services/useHaptics';
import { useGameService } from '../../services/useGameService';
import { useAudio } from '../../services/useAudioService';

const emit = defineEmits<{
  (e: 'returnToModerator'): void;
}>();
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';
const multiplayer = useMultiplayer();
const wakeLock = useWakeLock();
const haptics = useHaptics();
const gameService = useGameService();
const audio = useAudio();

const isDrawerOpen = ref(false);
const showGuideModal = ref(false);
const nameInputRef = ref<HTMLInputElement | null>(null);
const inputRoomCode = ref('');
const inputPlayerName = ref('');
const inputPasscode = ref('');
const lobbyNameInput = ref('');
const isEditingName = ref(false);
const isRoleRevealed = ref(false);
const isStealthMode = ref(true);
const selectedNightActionId = ref('');
const selectedNightTarget = ref('');
const submittedNightTarget = ref(false);
const detectiveResult = ref<any>(null);

// Voting State
const myPreVotes = ref<string[]>([]);
const myFinalVote = ref<string | null>(null);

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

const isPlayerClaimed = (name) => {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  if (effectivePlayerName.value && effectivePlayerName.value.trim().toLowerCase() === n) {
    return false;
  }
  if (publicState.value?.claimedPlayers && Array.isArray(publicState.value.claimedPlayers)) {
    return publicState.value.claimedPlayers.includes(n);
  }
  const matching = lobbyPlayersList.value.find((p) => (p.name || '').trim().toLowerCase() === n);
  return matching ? !!matching.isClaimed : false;
};

const availableNightActions = computed(() => {
  if (!playerIdentity.value?.role) return [];
  return gameService.getAvailableNightActions(playerIdentity.value.role);
});

const currentActionId = computed(() => {
  if (selectedNightActionId.value) return selectedNightActionId.value;
  return availableNightActions.value[0]?.id || 'pass';
});

const validNightTargets = computed(() => {
  const actionId = currentActionId.value;
  const allLiving = publicState.value?.livingPlayers || [];
  const allPlayers = publicState.value?.allPlayers || publicState.value?.setupPlayers || [];

  if (actionId === 'revive') {
    const livingNames = new Set(allLiving.map((p) => p.name));
    return allPlayers.filter((p) => !livingNames.has(p.name) || p.isDead);
  }
  if (actionId === 'treat-self') {
    return [playerIdentity.value].filter(Boolean);
  }
  return allLiving.filter((p) => p.name !== playerIdentity.value?.name);
});

const selectPlayerAction = (actionId) => {
  selectedNightActionId.value = actionId;
  selectedNightTarget.value = '';
  if (actionId === 'treat-self') {
    selectedNightTarget.value = playerIdentity.value?.name;
  }
};

const livingOtherPlayers = computed(() => {
  if (!publicState.value?.livingPlayers) return [];
  const myRole = playerIdentity.value?.role?.id;
  if (myRole === 'doctor') {
    return publicState.value.livingPlayers;
  }
  return publicState.value.livingPlayers.filter((p) => p.name !== playerIdentity.value?.name);
});

onMounted(() => {
  wakeLock.requestWakeLock();

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
      }
      multiplayer.joinRoom(
        joinCode,
        savedName || '',
        pin,
        transport || multiplayer.transportMode.value
      );
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
  wakeLock.requestWakeLock();
};

const submitLobbyName = () => {
  const name = lobbyNameInput.value.trim();
  if (!name) return;
  inputPlayerName.value = name;
  multiplayer.joinLobby(name, inputPasscode.value);
  isEditingName.value = false;
  wakeLock.requestWakeLock();
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
  wakeLock.requestWakeLock();
};

const handleDisconnect = () => {
  wakeLock.releaseWakeLock();
  multiplayer.disconnect();
};

const handleNightActionSubmit = () => {
  const actionId = currentActionId.value;
  let target = selectedNightTarget.value;

  if (actionId === 'pass') {
    target = null;
  } else if (actionId === 'treat-self') {
    target = playerIdentity.value?.name;
  }

  if (!target && actionId !== 'pass') return;

  multiplayer.sendNightAction(target, actionId === 'treat-self' ? 'treat' : actionId);
  submittedNightTarget.value = true;
  haptics.vibrateSuccess();

  // If player is Detective, calculate accurate inquiry feedback
  if (
    playerIdentity.value?.role?.id === 'detective' ||
    playerIdentity.value?.role?.name?.toLowerCase().includes('detective')
  ) {
    const allLiving = publicState.value?.allPlayers || publicState.value?.livingPlayers || [];
    const targetObj = allLiving.find((p) => p.name === target);
    if (targetObj?.role?.sideId === 'mafia' && targetObj?.role?.id !== 'godfather') {
      detectiveResult.value = 'mafia';
    } else {
      detectiveResult.value = 'town';
    }
  }
};

const currentVotingStage = computed(() => publicState.value?.votingState?.stage || 'pre-vote');

const qualifiedDefenders = computed(() => {
  const list = publicState.value?.votingState?.qualifiedDefenders || [];
  return list.filter((p) => p.name !== playerIdentity.value?.name);
});

const isMeQualifiedDefender = computed(() => {
  const list = publicState.value?.votingState?.qualifiedDefenders || [];
  return list.some(
    (p) =>
      (p.name || '').trim().toLowerCase() ===
      (playerIdentity.value?.name || '').trim().toLowerCase()
  );
});

watch(
  () => publicState.value?.subPhase,
  (newPhase, oldPhase) => {
    if (newPhase === 'night') {
      haptics.vibrateNightCall();
      selectedNightTarget.value = '';
      selectedNightActionId.value = '';
      submittedNightTarget.value = false;
      detectiveResult.value = null;
    } else if (newPhase === 'day' && oldPhase === 'night') {
      haptics.vibrateWarning();
    }

    if (newPhase !== 'voting') {
      myPreVotes.value = [];
      myFinalVote.value = null;
    }
  }
);

watch(
  () => publicState.value?.votingState?.stage,
  (newStage) => {
    if (newStage === 'final-vote') {
      myFinalVote.value = null;
    } else if (newStage === 'pre-vote') {
      myPreVotes.value = [];
    }
  }
);

const handleCastVote = (candidateName, voteType = 'pre') => {
  if (!candidateName) return;

  if (voteType === 'pre') {
    if (myPreVotes.value.includes(candidateName)) {
      myPreVotes.value = myPreVotes.value.filter((n) => n !== candidateName);
    } else {
      myPreVotes.value.push(candidateName);
    }
    multiplayer.sendVote(candidateName, 'pre');
    haptics.vibrateLight();
  } else if (voteType === 'final') {
    if (myFinalVote.value === candidateName) {
      myFinalVote.value = null;
    } else {
      myFinalVote.value = candidateName;
    }
    multiplayer.sendVote(candidateName, 'final');
    haptics.vibrateSuccess();
  }
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
