<template>
  <div class="w-full max-w-5xl mx-auto space-y-6">
    <!-- HEADER (NO REDUNDANT TOP BADGE AS APP.VUE ALREADY PROVIDES IT) -->
    <div class="text-center space-y-2 mb-6">
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        {{ $t('modeSelection.title') }}
      </h2>
      <p class="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
        {{ $t('modeSelection.subtitle') }}
      </p>
    </div>

    <!-- MODE CARDS LIST / GRID -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2 items-stretch">
      <div
        v-for="mode in availableModes"
        :key="mode.id"
        class="relative flex flex-col justify-between bg-gray-900/90 hover:bg-gray-850/90 border-2 rounded-2xl transition-all duration-300 cursor-pointer select-none group shadow-xl"
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

        <div class="flex-1 flex flex-col justify-between">
          <!-- COMPACT HEADER -->
          <div class="p-4 sm:p-5 flex items-center justify-between gap-3 min-h-[76px]">
            <div class="flex items-center gap-3.5 min-w-0">
              <!-- SCENARIO ICON (CLEAN BOLD VECTOR ARTWORK, NO REDUNDANT BORDER) -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center p-2 flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                :class="getModeIconClass(mode.id)"
              >
                <div
                  v-if="getScenarioSvg(mode.id)"
                  class="w-full h-full flex items-center justify-center"
                  v-html="getScenarioSvg(mode.id)"
                ></div>
                <span v-else class="text-2xl">{{ mode.id === 'godfather' ? '🎩' : mode.id === 'zodiac' ? '🏹' : mode.id === 'vendetta' ? '🤐' : '⚖️' }}</span>
              </div>

              <!-- TITLE & BADGES -->
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border shadow-sm"
                    :class="getModeBadgeClass(mode.id)"
                  >
                    {{ $t(getModeBadgeTextKey(mode.id)) }}
                  </span>
                  <span class="text-[11px] font-mono font-medium text-gray-400">
                    {{ mode.minPlayers }} {{ $t('modeSelection.players') }} • ⏱️
                    {{ mode.timeToTalk }}s
                  </span>
                </div>
                <h3
                  class="text-lg sm:text-xl font-black text-white group-hover:text-amber-400 transition-colors truncate"
                >
                  {{ $t('modes.' + mode.id + '.name') }}
                </h3>
              </div>
            </div>

            <!-- MOBILE-ONLY ACCORDION CHEVRON -->
            <div class="flex md:hidden items-center gap-2 flex-shrink-0">
              <span
                class="w-8 h-8 rounded-full flex items-center justify-center border text-xs sm:text-sm transition-all duration-300"
                :class="
                  selectedModeId === mode.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 rotate-180'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                "
              >
                ▼
              </span>
            </div>
          </div>

          <!-- DETAILS DRAWER (COLLAPSIBLE ON MOBILE, ALWAYS SHOWN SIDE-BY-SIDE ON DESKTOP) -->
          <div
            class="grid transition-all duration-300 ease-in-out md:!grid-rows-[1fr] md:!opacity-100 flex-1"
            :class="
              selectedModeId === mode.id
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0 pointer-events-none md:pointer-events-auto'
            "
          >
            <div class="overflow-hidden h-full flex flex-col justify-between">
              <div
                class="px-4 sm:px-5 pb-5 pt-0 space-y-3.5 border-t border-gray-800/60 flex-1 flex flex-col justify-between"
              >
                <!-- VECTOR ILLUSTRATION BANNER -->
                <div
                  class="w-full h-32 sm:h-36 mt-3 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner bg-gradient-to-b from-gray-950/80 to-gray-900/60 shrink-0"
                >
                  <div v-if="getSvg(mode.id)" class="w-full h-full" v-html="getSvg(mode.id)"></div>
                  <div v-else class="text-4xl">
                    {{ mode.id === 'godfather' ? '🎩' : '⚖️' }}
                  </div>
                </div>

                <!-- DESCRIPTION (UNIFORM HEIGHT FOR CRISP ALIGNMENT) -->
                <div class="min-h-[36px] md:min-h-[44px] flex items-center">
                  <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {{ $t('modes.' + mode.id + '.description') }}
                  </p>
                </div>

                <!-- CORE ROLES PREVIEW (FULL VISIBILITY ON MOBILE, MIN-HEIGHT ON DESKTOP) -->
                <div class="pt-2.5 border-t border-gray-800/80">
                  <span
                    class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5"
                  >
                    {{ $t('modeSelection.includedRoles') }}
                  </span>
                  <div class="flex flex-wrap content-start items-start gap-1.5 md:min-h-[58px]">
                    <span
                      v-for="role in getModeRoles(mode.id)"
                      :key="role.id"
                      class="px-2 py-0.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1 self-start"
                      :class="getRoleBadgeClass(role.sideId)"
                    >
                      <span>{{ role.icon }}</span>
                      <span>{{
                        $te('roles.' + role.id + '.name')
                          ? $t('roles.' + role.id + '.name')
                          : role.name
                      }}</span>
                    </span>
                  </div>
                </div>

                <!-- TIMINGS & STATS BAR (UNIFORM 3-COLUMN GRID) -->
                <div
                  class="pt-2.5 border-t border-gray-800 grid grid-cols-3 gap-2 text-center shrink-0"
                >
                  <div class="bg-gray-800/60 p-2 rounded-xl border border-gray-750">
                    <span class="block text-[10px] uppercase font-bold text-gray-400">{{
                      $t('modeSelection.speechTime')
                    }}</span>
                    <span class="text-xs sm:text-sm font-mono font-black text-white"
                      >⏱️ {{ mode.timeToTalk }}s</span
                    >
                  </div>
                  <div class="bg-gray-800/60 p-2 rounded-xl border border-gray-750">
                    <span class="block text-[10px] uppercase font-bold text-gray-400">{{
                      $t('modeSelection.challengeTime')
                    }}</span>
                    <span class="text-xs sm:text-sm font-mono font-black text-white"
                      >🔄 {{ mode.borrowedTimeToTalk }}s</span
                    >
                  </div>
                  <div class="bg-gray-800/60 p-2 rounded-xl border border-gray-750">
                    <span class="block text-[10px] uppercase font-bold text-gray-400">{{
                      $t('modeSelection.defenseTime')
                    }}</span>
                    <span class="text-xs sm:text-sm font-mono font-black text-white"
                      >🛡️ {{ mode.defenseTimeToTalk }}s</span
                    >
                  </div>
                </div>

                <!-- IN-CARD DIRECT ACTION BUTTON (IDENTICAL HEIGHT) -->
                <div class="pt-2 shrink-0">
                  <button
                    v-if="selectedModeId === mode.id"
                    class="w-full h-12 bg-gradient-to-r hover:brightness-110 active:scale-[0.98] text-white px-4 rounded-xl font-black text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    :class="getModeButtonGradientClass(mode.id)"
                    @click.stop="confirmMode"
                  >
                    <span>{{
                      $t('modeSelection.selectAndProceed', {
                        name: $t('modes.' + mode.id + '.name'),
                      })
                    }}</span>
                    <span class="inline-block rtl:rotate-180 transform transition-transform"
                      >➔</span
                    >
                  </button>

                  <button
                    v-else
                    class="w-full h-12 bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    @click.stop="selectMode(mode.id)"
                  >
                    <span>{{ $t('modeSelection.selectMode') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameService } from '../services/useGameService';
import { getModeIllustration, getScenarioIcon } from '../data/modeIllustrations';
import type { GameMode } from '../types';

const emit = defineEmits<{
  (e: 'mode-selected', mode: GameMode | undefined): void;
}>();
const { modes, fetchGameData } = useGameService();
const availableModes = ref<GameMode[]>([]);
const selectedModeId = ref<string>('godfather');

onMounted(async () => {
  await fetchGameData();
  availableModes.value = modes.value;
  if (availableModes.value.length > 0 && !selectedModeId.value) {
    selectedModeId.value = availableModes.value[0].id;
  }
});

const getSvg = (modeId: string) => {
  return getModeIllustration(modeId);
};

const getScenarioSvg = (modeId: string) => {
  return getScenarioIcon(modeId);
};

const selectMode = (modeId: string) => {
  selectedModeId.value = modeId;
};

const getModeIconClass = (modeId: string) => {
  if (modeId === 'godfather') return 'bg-red-950/60 text-red-400';
  if (modeId === 'zodiac') return 'bg-purple-950/60 text-purple-400';
  if (modeId === 'vendetta') return 'bg-amber-950/60 text-amber-400';
  return 'bg-blue-950/60 text-blue-400';
};

const getModeBadgeClass = (modeId: string) => {
  if (modeId === 'godfather') return 'bg-red-950/80 text-red-400 border-red-800/80';
  if (modeId === 'zodiac') return 'bg-purple-950/80 text-purple-400 border-purple-800/80';
  if (modeId === 'vendetta') return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
  return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
};

const getModeBadgeTextKey = (modeId: string) => {
  if (modeId === 'godfather') return 'modeSelection.tournamentStandardBadge';
  if (modeId === 'zodiac') return 'modeSelection.zodiacBadge';
  if (modeId === 'vendetta') return 'modeSelection.vendettaBadge';
  return 'modeSelection.classicStandardBadge';
};

const getModeButtonGradientClass = (modeId: string) => {
  if (modeId === 'godfather') return 'from-red-600 via-rose-600 to-amber-600 shadow-red-600/30';
  if (modeId === 'zodiac') return 'from-purple-600 via-fuchsia-600 to-indigo-600 shadow-purple-600/30';
  if (modeId === 'vendetta') return 'from-amber-600 via-orange-600 to-red-600 shadow-amber-600/30';
  return 'from-blue-600 via-indigo-600 to-cyan-600 shadow-blue-600/30';
};

const getCardClasses = (modeId: string) => {
  if (selectedModeId.value === modeId) {
    if (modeId === 'godfather') {
      return 'border-red-500 ring-2 ring-red-500/30 bg-gradient-to-b from-red-950/20 via-gray-900/90 to-gray-900 shadow-red-900/30';
    }
    if (modeId === 'zodiac') {
      return 'border-purple-500 ring-2 ring-purple-500/30 bg-gradient-to-b from-purple-950/20 via-gray-900/90 to-gray-900 shadow-purple-900/30';
    }
    if (modeId === 'vendetta') {
      return 'border-amber-500 ring-2 ring-amber-500/30 bg-gradient-to-b from-amber-950/20 via-gray-900/90 to-gray-900 shadow-amber-900/30';
    }
    return 'border-blue-500 ring-2 ring-blue-500/30 bg-gradient-to-b from-blue-950/20 via-gray-900/90 to-gray-900 shadow-blue-900/30';
  }
  return 'border-gray-800 hover:border-gray-700 bg-gray-900/60 opacity-85 hover:opacity-100';
};

const getModeRoles = (modeId: string) => {
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
  if (modeId === 'zodiac') {
    return [
      { id: 'zodiac', name: 'Zodiac', icon: '🏹', sideId: 'third-party' },
      { id: 'godfather', name: 'Godfather', icon: '🎩', sideId: 'mafia' },
      { id: 'mafia', name: 'Mafia', icon: '🕶️', sideId: 'mafia' },
      { id: 'bodyguard', name: 'Bodyguard', icon: '🛡️', sideId: 'town' },
      { id: 'doctor', name: 'Doctor', icon: '💉', sideId: 'town' },
      { id: 'detective', name: 'Detective', icon: '🔍', sideId: 'town' },
      { id: 'leon', name: 'Leon', icon: '🎯', sideId: 'town' },
      { id: 'citizen', name: 'Citizen', icon: '👤', sideId: 'town' },
    ];
  }
  if (modeId === 'vendetta') {
    return [
      { id: 'godfather', name: 'Godfather', icon: '🎩', sideId: 'mafia' },
      { id: 'silencer', name: 'Silencer', icon: '🤐', sideId: 'mafia' },
      { id: 'matador', name: 'Matador', icon: '🧣', sideId: 'mafia' },
      { id: 'priest', name: 'Priest', icon: '🕊️', sideId: 'town' },
      { id: 'constantine', name: 'Constantine', icon: '✨', sideId: 'town' },
      { id: 'doctor', name: 'Doctor', icon: '💉', sideId: 'town' },
      { id: 'detective', name: 'Detective', icon: '🔍', sideId: 'town' },
      { id: 'citizen', name: 'Citizen', icon: '👤', sideId: 'town' },
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

const getRoleBadgeClass = (sideId: string) => {
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
