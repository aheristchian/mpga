<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="fixed inset-0 z-[110] flex justify-end">
        <!-- BACKDROP -->
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- DRAWER CONTENT PANEL -->
        <div
          class="relative w-full max-w-xl bg-gray-900 border-l border-gray-700 h-full flex flex-col shadow-2xl z-10 text-white"
        >
          <!-- HEADER -->
          <div
            class="p-5 border-b border-gray-800 bg-gray-800/80 flex justify-between items-center"
          >
            <div>
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-white">{{ $t('gameModerator.drawerTitle') }}</h3>
                <span
                  class="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full font-mono"
                >
                  {{ filteredLogs.length }} / {{ store.gameLogs.length }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">{{ $t('gameModerator.drawerSubtitle') }}</p>
            </div>
            <button
              class="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              @click="$emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- FILTERS & SEARCH -->
          <div class="p-4 border-b border-gray-800 bg-gray-850 space-y-3">
            <!-- Search Input -->
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('gameModerator.searchPlaceholder')"
              class="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />

            <div class="flex flex-wrap gap-2 items-center justify-between">
              <!-- Day Filter Chips -->
              <div class="flex gap-1 overflow-x-auto pb-1 max-w-[280px]">
                <button
                  class="px-2.5 py-1 rounded text-xs font-semibold transition-colors shrink-0"
                  :class="
                    selectedDay === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  "
                  @click="selectedDay = 'all'"
                >
                  {{ $t('gameModerator.filterAll') }}
                </button>
                <button
                  v-for="d in availableDays"
                  :key="d"
                  class="px-2.5 py-1 rounded text-xs font-semibold transition-colors shrink-0"
                  :class="
                    selectedDay === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  "
                  @click="selectedDay = d"
                >
                  {{ $t('gameModerator.filterDay', { day: d }) }}
                </button>
              </div>

              <!-- Phase Filter Select -->
              <select
                v-model="selectedPhase"
                class="bg-gray-800 text-xs text-gray-300 px-2 py-1.5 rounded border border-gray-700 focus:outline-none"
              >
                <option value="all">All Phases</option>
                <option value="day">☀️ Day Phase</option>
                <option value="voting">⚖️ Voting Phase</option>
                <option value="midday">🃏 Midday Phase</option>
                <option value="night">🌙 Night Phase</option>
                <option value="moderator">🛡️ Moderator Overrides</option>
                <option value="system">⚙️ System</option>
              </select>
            </div>
          </div>

          <!-- LOG STREAM TIMELINE -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div v-if="filteredLogs.length === 0" class="text-center py-16 text-gray-500">
              <span class="text-4xl block mb-2">📜</span>
              <p class="text-sm">{{ $t('gameModerator.noLogsFound') }}</p>
            </div>

            <div
              v-for="log in filteredLogs"
              :key="log.id"
              class="bg-gray-800 rounded-lg p-3.5 border transition-all text-sm"
              :class="getLogBorderClass(log.type)"
            >
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                    :class="getLogBadgeClass(log.type)"
                  >
                    {{ log.type }}
                  </span>
                  <span class="text-xs text-gray-400 font-medium">Day {{ log.day }}</span>
                </div>
                <span class="text-[11px] font-mono text-gray-500">{{ log.timestamp }}</span>
              </div>

              <h4 class="font-bold text-white mb-1">{{ log.title }}</h4>
              <p v-if="log.detail" class="text-gray-300 text-xs leading-relaxed">
                {{ log.detail }}
              </p>

              <!-- Optional Player Tag -->
              <div v-if="log.player" class="mt-2 flex gap-1.5">
                <span class="text-[10px] font-bold bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                  👤 {{ log.player }}
                </span>
                <span
                  v-if="log.role"
                  class="text-[10px] font-semibold bg-gray-900 text-gray-400 px-2 py-0.5 rounded"
                >
                  {{ log.role }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['close']);

const store = useGameStore();

const searchQuery = ref('');
const selectedDay = ref('all');
const selectedPhase = ref('all');

const availableDays = computed(() => {
  const days = new Set(store.gameLogs.map((l) => l.day));
  return Array.from(days).sort((a, b) => a - b);
});

const filteredLogs = computed(() => {
  return store.gameLogs.filter((log) => {
    // Day match
    if (selectedDay.value !== 'all' && log.day !== selectedDay.value) {
      return false;
    }
    // Phase match
    if (selectedPhase.value !== 'all' && log.type !== selectedPhase.value) {
      return false;
    }
    // Search query match
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchTitle = log.title?.toLowerCase().includes(q);
      const matchDetail = log.detail?.toLowerCase().includes(q);
      const matchPlayer = log.player?.toLowerCase().includes(q);
      if (!matchTitle && !matchDetail && !matchPlayer) return false;
    }
    return true;
  });
});

const getLogBorderClass = (type) => {
  switch (type) {
    case 'day':
      return 'border-amber-500/40 bg-gray-800/90';
    case 'voting':
      return 'border-orange-500/40 bg-gray-800/90';
    case 'midday':
      return 'border-purple-500/40 bg-gray-800/90';
    case 'night':
      return 'border-indigo-500/40 bg-gray-800/90';
    case 'moderator':
      return 'border-red-500/40 bg-red-950/20';
    default:
      return 'border-gray-700 bg-gray-800';
  }
};

const getLogBadgeClass = (type) => {
  switch (type) {
    case 'day':
      return 'bg-amber-900/60 text-amber-300 border border-amber-700';
    case 'voting':
      return 'bg-orange-900/60 text-orange-300 border border-orange-700';
    case 'midday':
      return 'bg-purple-900/60 text-purple-300 border border-purple-700';
    case 'night':
      return 'bg-indigo-900/60 text-indigo-300 border border-indigo-700';
    case 'moderator':
      return 'bg-red-900/60 text-red-300 border border-red-700';
    default:
      return 'bg-gray-700 text-gray-300';
  }
};
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease-in-out;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}
</style>
