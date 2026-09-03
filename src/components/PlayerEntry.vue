<template>
  <div class="w-full max-w-2xl mx-auto space-y-6">
    <!-- MODE TOGGLE HEADER -->
    <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl space-y-5">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-black text-white flex items-center gap-2">
            <span>👥</span>
            <span>{{ $t('playerEntry.addPlayers') }}</span>
          </h2>
          <p class="text-xs text-gray-400 mt-1">{{ $t('playerEntry.lobbySubtitle') }}</p>
        </div>

        <!-- TAB SWITCHER: LOBBY vs MANUAL -->
        <div class="flex bg-gray-900 p-1 rounded-xl border border-gray-700 shrink-0">
          <button
            class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 select-none"
            :class="
              activeTab === 'lobby'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            @click="activeTab = 'lobby'"
          >
            <span>📱</span>
            <span>{{ $t('playerEntry.modeLobby') }}</span>
          </button>
          <button
            class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 select-none"
            :class="
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            "
            @click="activeTab = 'manual'"
          >
            <span>⌨️</span>
            <span>{{ $t('playerEntry.modeManual') }}</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: LIVE ROOM LOBBY (QR + ROOM CODE + PASSCODE + TRANSPORT) -->
      <div
        v-if="activeTab === 'lobby'"
        class="bg-gradient-to-r from-blue-950/60 via-gray-900 to-indigo-950/60 p-5 rounded-2xl border border-blue-500/30 space-y-4"
      >
        <!-- TRANSPORT ENGINE SELECTOR -->
        <div class="bg-gray-900/90 p-3 rounded-xl border border-blue-500/20 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
              <span>🌐</span>
              <span>{{ $t('multiplayer.transportMode') }}</span>
            </span>
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1"
              :class="
                multiplayer.connectionStatus.value === 'connected'
                  ? 'bg-green-950/80 text-green-300 border border-green-500/50'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
              "
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="
                  multiplayer.connectionStatus.value === 'connected'
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-amber-400 animate-pulse'
                "
              ></span>
              <span>{{ multiplayer.connectionStatus.value }}</span>
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between select-none"
              :class="
                multiplayer.transportMode.value === 'cloud'
                  ? 'bg-blue-950/80 border-blue-400 text-white shadow-md'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
              "
              @click="multiplayer.setTransportMode('cloud')"
            >
              <span class="text-xs font-bold">{{ $t('multiplayer.cloudRelay') }}</span>
              <span class="text-[10px] opacity-75 mt-0.5 leading-tight">{{
                $t('multiplayer.cloudRelayDesc')
              }}</span>
            </button>

            <button
              type="button"
              class="p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between select-none"
              :class="
                multiplayer.transportMode.value === 'webrtc'
                  ? 'bg-blue-950/80 border-blue-400 text-white shadow-md'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-white'
              "
              @click="multiplayer.setTransportMode('webrtc')"
            >
              <span class="text-xs font-bold">{{ $t('multiplayer.webrtcP2p') }}</span>
              <span class="text-[10px] opacity-75 mt-0.5 leading-tight">{{
                $t('multiplayer.webrtcP2pDesc')
              }}</span>
            </button>
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-center gap-6">
          <!-- QR Code Canvas -->
          <div class="bg-white p-2.5 rounded-2xl shadow-xl shrink-0 flex flex-col items-center">
            <QrcodeVue :value="joinUrl" :size="130" level="M" render-as="svg" />
          </div>

          <!-- Room Code & Passcode Controls -->
          <div class="flex-1 space-y-3 text-center md:text-left w-full">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                {{ $t('playerEntry.roomCode') }}
              </span>
              <div class="flex items-center justify-center md:justify-start gap-2 mt-0.5">
                <span class="text-3xl font-black text-white font-mono tracking-widest">
                  {{ multiplayer.roomCode.value || '----' }}
                </span>
                <button
                  class="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs cursor-pointer"
                  :title="$t('playerEntry.regenerateCode')"
                  @click="multiplayer.regenerateRoomCode()"
                >
                  🔄
                </button>
              </div>
            </div>

            <!-- OPTIONAL ROOM PIN/PASSCODE SETTING -->
            <div class="bg-gray-900/80 p-3 rounded-xl border border-gray-700/60 space-y-1.5">
              <label class="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                <span>🔒</span>
                <span>{{ $t('playerEntry.enablePasscode') }}</span>
              </label>
              <div class="flex gap-2">
                <input
                  v-model="passcodeInput"
                  type="text"
                  maxlength="8"
                  :placeholder="$t('playerEntry.passcodePlaceholder')"
                  class="bg-gray-800 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 max-w-[160px]"
                  @input="handlePasscodeChange"
                />
                <span class="text-[10px] text-gray-400 flex items-center">
                  {{ passcodeInput ? '🔒 PIN Protected' : '🔓 Open Room' }}
                </span>
              </div>
            </div>

            <!-- COPY JOIN LINK -->
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                @click="copyJoinUrl"
              >
                <span>🔗</span>
                <span>{{
                  copied ? $t('playerEntry.linkCopied') : $t('playerEntry.copyLink')
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- CONNECTED DEVICES LIVE STATUS BAR -->
        <div class="bg-gray-900/80 p-3 rounded-xl border border-blue-500/20 space-y-2">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-gray-300 flex items-center gap-1.5">
              <span
                class="w-2 h-2 rounded-full"
                :class="
                  multiplayer.connectedPeers.value.length > 0
                    ? 'bg-green-400 animate-pulse'
                    : 'bg-gray-500'
                "
              ></span>
              <span>{{
                $t('multiplayer.connectedDevices', {
                  count: multiplayer.connectedPeers.value.length,
                })
              }}</span>
            </span>
            <span
              v-if="multiplayer.connectedPeers.value.length > 0"
              class="text-[10px] text-green-400 font-medium"
            >
              {{ $t('multiplayer.liveSyncActive') }}
            </span>
          </div>

          <div
            v-if="multiplayer.connectedPeers.value.length > 0"
            class="flex items-center gap-1.5 flex-wrap"
          >
            <span
              v-for="peer in multiplayer.connectedPeers.value"
              :key="peer.peerId"
              class="bg-blue-950/80 border border-blue-500/50 text-blue-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
            >
              <span>📱</span>
              <span>{{ peer.playerName || $t('multiplayer.unnamedDevice') }}</span>
            </span>
          </div>
          <p v-else class="text-[11px] text-gray-400 italic">
            {{ $t('playerEntry.waitingForPlayers') }}
          </p>
        </div>
      </div>

      <!-- TAB 2: MANUAL QUICK ADD FORM & RECENT PLAYER SUGGESTIONS -->
      <div v-else class="space-y-3">
        <form class="flex gap-2" @submit.prevent="addPlayer">
          <input
            ref="playerInputRef"
            v-model="newPlayerName"
            type="text"
            :placeholder="$t('playerEntry.placeholder')"
            class="flex-1 min-w-0 bg-gray-700/90 text-white placeholder-gray-400 px-3.5 sm:px-4 py-2.5 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[44px] text-sm"
            @input="handleInput"
          />
          <button
            type="submit"
            class="active:scale-95 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer min-h-[44px] select-none whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 border border-blue-400/40"
            :class="
              newPlayerName.trim()
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md shadow-blue-600/30'
            "
          >
            <span class="text-base leading-none">➕</span>
            <span>{{ $t('playerEntry.add') }}</span>
          </button>
        </form>

        <!-- RECENT PLAYERS QUICK SUGGESTIONS -->
        <div
          v-if="availableSuggestions.length > 0"
          class="bg-gray-900/60 p-3 rounded-xl border border-gray-700/60 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <span>⚡</span>
              <span>{{ $t('playerEntry.quickSuggestions') }}</span>
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-gray-400 hidden sm:inline">
                {{ $t('playerEntry.tapToAdd') }}
              </span>
              <button
                type="button"
                class="text-[10px] text-gray-400 hover:text-red-400 underline transition-colors cursor-pointer"
                @click="handleClearRecent"
              >
                {{ $t('playerEntry.clearRecent') }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-0.5">
            <button
              v-for="name in availableSuggestions"
              :key="name"
              type="button"
              class="bg-gray-800 hover:bg-blue-600/30 active:scale-95 border border-gray-700 hover:border-blue-500/60 text-gray-200 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer select-none"
              @click="addSuggestedPlayer(name)"
            >
              <span class="text-xs text-gray-400">👤</span>
              <span>{{ name }}</span>
              <span class="text-blue-400 text-xs font-bold leading-none">➕</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SEATED PLAYERS ROSTER -->
    <div class="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-xl space-y-4">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700 pb-2.5 gap-1.5"
      >
        <div class="flex items-center gap-2">
          <h3 class="text-base sm:text-lg font-bold text-gray-200">
            {{ $t('playerEntry.currentPlayers') }}
          </h3>
          <span
            class="bg-blue-900/60 border border-blue-700 text-blue-200 text-xs px-2 py-0.5 rounded-full font-bold"
          >
            {{ players.length }}
          </span>
        </div>
        <span class="text-[11px] sm:text-xs text-gray-400 font-normal">
          {{ $t('playerEntry.orderBySeating') }}
        </span>
      </div>

      <div v-if="players.length > 0">
        <ul class="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          <li
            v-for="(player, index) in players"
            :key="index"
            draggable="true"
            class="flex justify-between items-center bg-gray-750 px-3.5 py-2.5 rounded-xl group cursor-grab active:cursor-grabbing transition-transform min-h-[44px] border border-gray-700/60"
            :class="{
              'opacity-50 border-dashed border-2 border-town': draggedIndex === index,
              'border-t-2 border-town': dropTargetIndex === index && draggedIndex !== index,
            }"
            @dragstart="onDragStart($event, index)"
            @dragover.prevent
            @dragenter.prevent="onDragEnter($event, index)"
            @drop="onDrop($event, index)"
            @dragend="onDragEnd"
          >
            <div class="flex items-center gap-3">
              <span class="text-gray-500 cursor-grab px-1 select-none">☰</span>
              <span class="text-white font-medium text-sm">{{ index + 1 }}. {{ player.name }}</span>
              <span
                v-if="isPeerConnected(player.name)"
                class="bg-green-950/80 border border-green-500/60 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span>{{ $t('playerEntry.playerConnectedBadge') }}</span>
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                :disabled="index === 0"
                class="text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed p-1.5 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center select-none text-xs"
                :title="$t('playerEntry.moveUp')"
                :aria-label="$t('playerEntry.moveUp')"
                @click.stop="movePlayer(index, -1)"
              >
                ▲
              </button>
              <button
                type="button"
                :disabled="index === players.length - 1"
                class="text-gray-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed p-1.5 bg-gray-800 rounded-lg hover:bg-gray-750 transition-all cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center select-none text-xs"
                :title="$t('playerEntry.moveDown')"
                :aria-label="$t('playerEntry.moveDown')"
                @click.stop="movePlayer(index, 1)"
              >
                ▼
              </button>
              <button
                class="text-red-400 hover:text-red-300 active:scale-95 text-xs font-medium px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all cursor-pointer min-h-[36px] select-none"
                @click="removePlayer(index)"
              >
                {{ $t('playerEntry.remove') }}
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-else class="text-center text-gray-500 py-6 italic text-sm">
        {{
          activeTab === 'lobby' ? $t('playerEntry.waitingForPlayers') : $t('playerEntry.noPlayers')
        }}
      </div>

      <!-- PROCEED TO ROLES BUTTON -->
      <div
        class="mt-4 pt-3 border-t border-gray-700/60 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3"
      >
        <p v-if="players.length < minPlayers" class="text-xs text-yellow-500">
          ⚠️ {{ $t('playerEntry.needMore', { min: minPlayers }) }}
        </p>
        <div v-else></div>

        <button
          :disabled="players.length < minPlayers"
          class="bg-green-600 hover:bg-green-500 active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-md transition-all cursor-pointer min-h-[44px] select-none flex items-center justify-center gap-1.5 w-full sm:w-auto"
          @click="finishAddingPlayers"
        >
          <span>{{ $t('playerEntry.done') }}</span>
          <span class="inline-block rtl:rotate-180 transform transition-transform">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { useMultiplayer } from '../services/useMultiplayerService';
import {
  saveEncoded,
  loadEncoded,
  getRecentPlayers,
  saveRecentPlayer,
  clearRecentPlayers,
} from '../utils/storage';
import QrcodeVue from 'qrcode.vue';

defineProps({
  minPlayers: {
    type: Number,
    default: 4,
  },
});

const emit = defineEmits(['players-ready']);
const store = useGameStore();
const multiplayer = useMultiplayer();

const activeTab = ref('lobby');
const newPlayerName = ref('');
const playerInputRef = ref<HTMLInputElement | null>(null);
const passcodeInput = ref(multiplayer.roomPasscode.value || '');
const copied = ref(false);

const recentPlayerNames = ref<string[]>([]);

const refreshRecentPlayers = () => {
  recentPlayerNames.value = getRecentPlayers();
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  newPlayerName.value = target.value;
};

const players = computed({
  get: () => store.players,
  set: (val) => {
    store.players = val;
  },
});

onMounted(() => {
  refreshRecentPlayers();
  if (recentPlayerNames.value.length === 0) {
    const fallbackNames = new Set<string>();
    store.livePlayers.forEach((p) => {
      if (p.name?.trim()) fallbackNames.add(p.name.trim());
    });
    store.players.forEach((p) => {
      if (p.name?.trim()) fallbackNames.add(p.name.trim());
    });
    if (fallbackNames.size > 0) {
      fallbackNames.forEach((n) => saveRecentPlayer(n));
      refreshRecentPlayers();
    }
  }

  const savedPlayers = loadEncoded('mpga_setup_players');
  if (
    savedPlayers &&
    Array.isArray(savedPlayers) &&
    savedPlayers.length > 0 &&
    store.players.length === 0
  ) {
    store.players = savedPlayers;
  }
  if (!multiplayer.isHost.value) {
    multiplayer.startHost();
  }
});

watch(
  () => store.players,
  (newPlayers) => {
    saveEncoded('mpga_setup_players', newPlayers);
    if (multiplayer.isHost.value) {
      multiplayer.broadcastHostState(store);
    }
  },
  { deep: true }
);

const joinUrl = computed(() => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const path = window.location.pathname;
  let url = `${origin}${path}?join=${multiplayer.roomCode.value}&t=${multiplayer.transportMode.value}`;
  if (passcodeInput.value.trim()) {
    url += `&pin=${encodeURIComponent(passcodeInput.value.trim())}`;
  }
  return url;
});

const handlePasscodeChange = () => {
  multiplayer.setRoomPasscode(passcodeInput.value);
};

const copyJoinUrl = async () => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(joinUrl.value);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2500);
    }
  } catch {
    // ignore
  }
};

const isPeerConnected = (playerName) => {
  return multiplayer.isPeerConnected(playerName);
};

// Drag and Drop State
const draggedIndex = ref(null);
const dropTargetIndex = ref(null);

const availableSuggestions = computed(() => {
  const seatedSet = new Set(store.players.map((p) => p.name.trim().toLowerCase()));
  const query = newPlayerName.value.trim().toLowerCase();

  return recentPlayerNames.value
    .filter((name) => !seatedSet.has(name.toLowerCase()))
    .filter((name) => {
      if (!query) return true;
      return name.toLowerCase().includes(query);
    })
    .slice(0, 16);
});

const addPlayer = () => {
  const inputEl = playerInputRef.value;
  const rawValue = inputEl ? inputEl.value : newPlayerName.value;
  const name = (rawValue || newPlayerName.value).trim();
  if (name) {
    store.addSetupPlayer(name);
    newPlayerName.value = '';
    if (inputEl) {
      inputEl.value = '';
    }
    refreshRecentPlayers();
  }
  inputEl?.focus();
};

const addSuggestedPlayer = (name: string) => {
  store.addSetupPlayer(name);
  refreshRecentPlayers();
  playerInputRef.value?.focus();
};

const handleClearRecent = () => {
  clearRecentPlayers();
  refreshRecentPlayers();
};

const removePlayer = (index) => {
  store.removeSetupPlayer(index);
};

const movePlayer = (fromIndex: number, direction: -1 | 1) => {
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= players.value.length) return;
  store.reorderSetupPlayers(fromIndex, toIndex);
};

// --- DRAG AND DROP LOGIC ---
const onDragStart = (event, index) => {
  draggedIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index);
};

const onDragEnter = (event, index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dropTargetIndex.value = index;
  }
};

const onDrop = (event, index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    store.reorderSetupPlayers(draggedIndex.value, index);
  }
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

const onDragEnd = () => {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

const finishAddingPlayers = () => {
  emit('players-ready', store.players);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
