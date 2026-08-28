<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('multiplayer.hostTitle')"
    max-width="max-w-2xl"
    @close="$emit('close')"
  >
    <div class="space-y-6">
      <!-- ROOM CODE & QR SECTION -->
      <div
        class="bg-gradient-to-r from-blue-950 via-gray-900 to-indigo-950 p-6 rounded-2xl border border-blue-500/40 text-center shadow-xl relative overflow-hidden"
      >
        <p class="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">
          {{ $t('multiplayer.roomCodeLabel') }}
        </p>
        <div class="text-4xl font-black text-white tracking-widest font-mono mb-4">
          {{ multiplayer.roomCode.value || '----' }}
        </div>

        <!-- QR CODE -->
        <div class="flex justify-center mb-4">
          <div class="bg-white p-3 rounded-2xl shadow-2xl inline-block">
            <QrcodeVue :value="joinUrl" :size="160" level="M" render-as="svg" />
          </div>
        </div>

        <p class="text-xs text-gray-300 max-w-sm mx-auto mb-3">
          {{ $t('multiplayer.scanPrompt') }}
        </p>

        <!-- DIRECT LINK COPY BAR -->
        <div class="flex items-center justify-center gap-2 max-w-md mx-auto mb-3">
          <input
            type="text"
            readonly
            :value="joinUrl"
            class="bg-gray-900/80 border border-gray-700 text-xs text-gray-300 px-3 py-2 rounded-lg flex-1 truncate font-mono select-all text-center"
          />
          <button
            class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
            @click="copyJoinUrl"
          >
            {{ copied ? $t('multiplayer.copied') : $t('multiplayer.copyLink') }}
          </button>
        </div>

        <!-- LOCALHOST LAN HELPER -->
        <div
          v-if="isLocalhost"
          class="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 max-w-md mx-auto text-left text-[11px] text-amber-200/90 space-y-2"
        >
          <div class="flex items-start gap-1.5 font-semibold text-amber-300">
            <span>💡</span>
            <span>{{ $t('multiplayer.lanWarning') }}</span>
          </div>
          <p class="text-amber-200/70 text-[10px]">
            {{ $t('multiplayer.lanInstruction', { ip: '192.168.x.x' }) }}
          </p>
          <div class="flex gap-1.5">
            <input
              v-model="customHostInput"
              type="text"
              :placeholder="$t('multiplayer.customHostPlaceholder')"
              class="bg-gray-900 border border-amber-500/40 text-amber-100 px-2.5 py-1.5 rounded-lg flex-1 text-xs font-mono"
              @keydown.enter="saveCustomHost"
            />
            <button
              class="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
              @click="saveCustomHost"
            >
              {{ $t('multiplayer.applyHost') }}
            </button>
            <button
              v-if="customHost"
              class="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors"
              @click="resetCustomHost"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- CONNECTED PLAYERS LIST -->
      <div>
        <h4
          class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between"
        >
          <span
            >{{ $t('multiplayer.connectedDevices') }} ({{ connectedCount }} /
            {{ store.livePlayers.length }})</span
          >
          <span class="text-green-400 text-[11px] flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {{ $t('multiplayer.liveSyncActive') }}
          </span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            v-for="(player, idx) in store.livePlayers"
            :key="player.name"
            class="p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
            :class="
              isPlayerConnected(player.name)
                ? 'bg-green-950/30 border-green-700/60 text-green-200'
                : 'bg-gray-800/60 border-gray-700 text-gray-400'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="font-mono text-gray-500 text-[10px]">#{{ idx + 1 }}</span>
              <RoleAvatar :role="player.role" :is-dead="player.isDead" size="sm" />
              <div class="truncate">
                <span class="font-bold text-white truncate block">{{ player.name }}</span>
                <span class="text-[10px] text-gray-400 truncate block">{{
                  player.role?.name || 'Citizen'
                }}</span>
              </div>
            </div>

            <div class="shrink-0">
              <span
                v-if="isPlayerConnected(player.name)"
                class="bg-green-900/60 border border-green-500 text-green-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
              >
                <span>📱</span> {{ $t('multiplayer.connected') }}
              </span>
              <span
                v-else
                class="bg-gray-700/60 text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-medium"
              >
                {{ $t('multiplayer.offline') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <span class="text-[11px] text-gray-400">
          {{ $t('multiplayer.offlineNote') }}
        </span>
        <button
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-xs rounded-xl transition-colors"
          @click="$emit('close')"
        >
          {{ $t('gameModerator.close') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import BaseModal from '../BaseModal.vue';
import RoleAvatar from '../RoleAvatar.vue';
import { useGameStore } from '../../stores/gameStore';
import { useMultiplayer } from '../../services/useMultiplayerService';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close']);

const store = useGameStore();
const multiplayer = useMultiplayer();
const copied = ref(false);

const customHost = ref(
  typeof localStorage !== 'undefined' ? localStorage.getItem('mpga_custom_host') || '' : ''
);
const customHostInput = ref(customHost.value);

const isLocalhost = computed(() => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
});

const saveCustomHost = () => {
  let val = customHostInput.value.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) {
    val = val.replace(/^https?:\/\//, '');
  }
  customHost.value = val;
  if (typeof localStorage !== 'undefined') {
    if (val) {
      localStorage.setItem('mpga_custom_host', val);
    } else {
      localStorage.removeItem('mpga_custom_host');
    }
  }
};

const resetCustomHost = () => {
  customHost.value = '';
  customHostInput.value = '';
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('mpga_custom_host');
  }
};

const joinUrl = computed(() => {
  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  if (customHost.value) {
    const protocol = window.location.protocol;
    origin = `${protocol}//${customHost.value}`;
  }
  const base = origin + window.location.pathname;
  return `${base}?join=${multiplayer.roomCode.value}`;
});

const isPlayerConnected = (playerName) => {
  return multiplayer.connectedPeers.value.some((p) => p.playerName === playerName);
};

const connectedCount = computed(() => {
  return store.livePlayers.filter((p) => isPlayerConnected(p.name)).length;
});

const copyJoinUrl = async () => {
  try {
    await navigator.clipboard.writeText(joinUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Fallback
  }
};
</script>
