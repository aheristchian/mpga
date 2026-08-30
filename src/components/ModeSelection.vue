<template>
  <div class="w-full max-w-5xl mx-auto space-y-6">
    <!-- HEADER -->
    <div class="text-center space-y-2 mb-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/90 border border-gray-700/80 rounded-full text-xs font-semibold text-gray-300 shadow-sm">
        <span>🎭</span>
        <span>{{ $t('app.badge') }}</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        {{ $t('modeSelection.title') }}
      </h2>
      <p class="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
        {{ $t('modeSelection.subtitle') }}
      </p>
    </div>

    <!-- MODE CARDS LIST / GRID -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
      <div
        v-for="mode in availableModes"
        :key="mode.id"
        class="relative flex flex-col bg-gray-900/90 hover:bg-gray-850 border-2 rounded-2xl transition-all duration-300 cursor-pointer select-none group shadow-xl"
        :class="getCardClasses(mode.id)"
        @click="selectMode(mode.id)"
      >
        <!-- ACTIVE FLOATING CHECKMARK BADGE (OUTSIDE BORDER) -->
        <div
          v-if="selectedModeId === mode.id"
          class="absolute -top-3 -right-3 rtl:-right-auto rtl:-left-3 sm:-top-3.5 sm:-right-3.5 rtl:sm:-left-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg shadow-green-500/30 border-2 border-gray-900 z-20 animate-bounce-short"
        >
          ✓
        </div>

        <!-- COMPACT HEADER (ALWAYS VISIBLE & COMPACT ON MOBILE) -->
        <div class="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- SCENARIO ICON -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md border transition-transform duration-300 group-hover:scale-105"
              :class="
                mode.id === 'godfather'
                  ? 'bg-red-950/70 border-red-800/70 text-red-300'
                  : 'bg-blue-950/70 border-blue-800/70 text-blue-300'
              "
            >
              {{ mode.id === 'godfather' ? '🎩' : '⚖️' }}
            </div>

            <!-- TITLE & BADGES -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border shadow-sm"
                  :class="
                    mode.id === 'godfather'
                      ? 'bg-red-950/80 text-red-400 border-red-800/80'
                      : 'bg-blue-950/80 text-blue-400 border-blue-800/80'
                  "
                >
                  {{ mode.id === 'godfather' ? $t('modeSelection.tournamentStandardBadge') : $t('modeSelection.classicStandardBadge') }}
                </span>
                <span class="text-[11px] font-mono font-medium text-gray-400">
                  {{ mode.minPlayers }} {{ $t('modeSelection.players') }} • ⏱️ {{ mode.timeToTalk }}s
                </span>
              </div>
              <h3 class="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors truncate">
                {{ $t('modes.' + mode.id + '.name') }}
              </h3>
            </div>
          </div>

          <!-- ACCORDION CHEVRON / SELECTOR INDICATOR -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span
              class="w-8 h-8 rounded-full flex items-center justify-center border text-xs sm:text-sm transition-all duration-300"
              :class="
                selectedModeId === mode.id
                  ? (mode.id === 'godfather' ? 'bg-red-500/20 border-red-500 text-red-400 rotate-180' : 'bg-blue-500/20 border-blue-500 text-blue-400 rotate-180')
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              "
            >
              ▼
            </span>
          </div>
        </div>

        <!-- EXPANDABLE DETAILS DRAWER (SMOOTH CSS GRID EXPANSION) -->
        <div
          class="grid transition-all duration-300 ease-in-out"
          :class="selectedModeId === mode.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'"
        >
          <div class="overflow-hidden">
            <div class="px-4 sm:px-5 pb-5 pt-0 space-y-4 border-t border-gray-800/60">
              <!-- VECTOR ILLUSTRATION BANNER -->
              <div
                class="w-full h-28 sm:h-36 mt-4 rounded-xl overflow-hidden border transition-transform duration-300 shadow-inner flex items-center justify-center"
                :class="mode.id === 'godfather' ? 'border-red-900/50 bg-red-950/20' : 'border-blue-900/50 bg-blue-950/20'"
              >
                <div
                  v-if="getSvg(mode.id)"
                  class="w-full h-full"
                  v-html="getSvg(mode.id)"
                ></div>
                <div v-else class="text-4xl">
                  {{ mode.id === 'godfather' ? '🎩' : '⚖️' }}
                </div>
              </div>

              <!-- DESCRIPTION -->
              <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {{ $t('modes.' + mode.id + '.description') }}
              </p>

              <!-- CORE ROLES PREVIEW -->
              <div class="pt-2 border-t border-gray-800/80">
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  {{ $t('modeSelection.includedRoles') }}
                </span>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="role in getModeRoles(mode.id)"
                    :key="role.id"
                    class="px-2 py-0.5 rounded-lg text-xs font-medium border"
                    :class="getRoleBadgeClass(role.sideId)"
                  >
                    {{ role.icon }} {{ $te('roles.' + role.id + '.name') ? $t('roles.' + role.id + '.name') : role.name }}
                  </span>
                </div>
              </div>

              <!-- TIMINGS & STATS BAR -->
              <div class="pt-2 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
                <div class="bg-gray-800/60 p-2 rounded-xl border border-gray-750">
                  <span class="block text-[10px] uppercase font-bold text-gray-400">{{ $t('modeSelection.speechTime') }}</span>
                  <span class="text-xs sm:text-sm font-mono font-black text-white">⏱️ {{ mode.timeToTalk }}s</span>
                </div>
                <div class="bg-gray-800/60 p-2 rounded-xl border border-gray-750">
                  <span class="block text-[10px] uppercase font-bold text-gray-400">{{ $t('modeSelection.challengeTime') }}</span>
                  <span class="text-xs sm:text-sm font-mono font-black text-white">🔄 {{ mode.borrowedTimeToTalk }}s</span>
                </div>
                <div class="bg-gray-800/60 p-2 rounded-xl border border-gray-750">
                  <span class="block text-[10px] uppercase font-bold text-gray-400">{{ $t('modeSelection.defenseTime') }}</span>
                  <span class="text-xs sm:text-sm font-mono font-black text-white">🛡️ {{ mode.defenseTimeToTalk }}s</span>
                </div>
              </div>

              <!-- IN-CARD DIRECT ACTION BUTTON (NO DEEP SCROLLING NEEDED) -->
              <div class="pt-2">
                <button
                  class="w-full bg-gradient-to-r hover:brightness-110 active:scale-[0.98] text-white py-3.5 px-4 rounded-xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  :class="
                    mode.id === 'godfather'
                      ? 'from-red-600 via-rose-600 to-amber-600 shadow-red-600/30'
                      : 'from-blue-600 via-indigo-600 to-cyan-600 shadow-blue-600/30'
                  "
                  @click.stop="confirmMode"
                >
                  <span>{{ $t('modeSelection.selectAndProceed', { name: $t('modes.' + mode.id + '.name') }) }}</span>
                  <span class="rtl:rotate-180">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM PROCEED BAR (SECONDARY CONVENIENCE) -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900/80 border border-gray-800 p-4 rounded-2xl shadow-xl">
      <div class="text-center sm:text-left rtl:sm:text-right">
        <p class="text-xs text-gray-400 font-medium">
          {{ $t('modeSelection.selected') }}:
          <strong class="text-white text-sm font-bold ml-1 rtl:mr-1">
            {{ selectedModeId ? $t('modes.' + selectedModeId + '.name') : '---' }}
          </strong>
        </p>
      </div>

      <button
        :disabled="!selectedModeId"
        class="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        @click="confirmMode"
      >
        <span>{{ $t('modeSelection.continue') }}</span>
        <span class="rtl:rotate-180">➔</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameService } from '../services/useGameService';
import { getModeIllustration } from '../data/modeIllustrations';

const emit = defineEmits(['mode-selected']);
const { modes, fetchGameData } = useGameService();
const availableModes = ref([]);
const selectedModeId = ref('godfather');

onMounted(async () => {
  await fetchGameData();
  availableModes.value = modes.value;
  if (availableModes.value.length > 0 && !selectedModeId.value) {
    selectedModeId.value = availableModes.value[0].id;
  }
});

const getSvg = (modeId) => {
  return getModeIllustration(modeId);
};

const selectMode = (modeId) => {
  selectedModeId.value = modeId;
};

const getCardClasses = (modeId) => {
  if (selectedModeId.value === modeId) {
    if (modeId === 'godfather') {
      return 'border-red-500 ring-2 ring-red-500/40 bg-gradient-to-b from-red-950/20 to-gray-900 shadow-red-900/20';
    }
    return 'border-blue-500 ring-2 ring-blue-500/40 bg-gradient-to-b from-blue-950/20 to-gray-900 shadow-blue-900/20';
  }
  return 'border-gray-800 hover:border-gray-700 bg-gray-900/70';
};

const getModeRoles = (modeId) => {
  if (modeId === 'godfather') {
    return [
      { id: 'godfather', name: 'Godfather', icon: '🎩', sideId: 'mafia' },
      { id: 'matador', name: 'Matador', icon: '🧣', sideId: 'mafia' },
      { id: 'saul-goodman', name: 'Saul Goodman', icon: '💼', sideId: 'mafia' },
      { id: 'doctor', name: 'Doctor', icon: '💉', sideId: 'town' },
      { id: 'detective', name: 'Detective', icon: '🔍', sideId: 'town' },
      { id: 'leon', name: 'Leon', icon: '🎯', sideId: 'town' },
      { id: 'constantine', name: 'Constantine', icon: '✨', sideId: 'town' },
      { id: 'nostradamus', name: 'Nostradamus', icon: '🔮', sideId: 'third-party' },
    ];
  }
  return [
    { id: 'godfather', name: 'Godfather', icon: '🎩', sideId: 'mafia' },
    { id: 'mafia', name: 'Mafia', icon: '🕶️', sideId: 'mafia' },
    { id: 'doctor', name: 'Doctor', icon: '💉', sideId: 'town' },
    { id: 'detective', name: 'Detective', icon: '🔍', sideId: 'town' },
    { id: 'citizen', name: 'Citizen', icon: '👤', sideId: 'town' },
  ];
};

const getRoleBadgeClass = (sideId) => {
  if (sideId === 'mafia') {
    return 'bg-red-950/60 text-red-300 border-red-800/60';
  }
  if (sideId === 'third-party') {
    return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
  }
  return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
};

const confirmMode = () => {
  if (selectedModeId.value) {
    const selectedMode = availableModes.value.find((m) => m.id === selectedModeId.value);
    emit('mode-selected', selectedMode);
  }
};
</script>

