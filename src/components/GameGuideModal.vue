<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from './BaseModal.vue';
import { useGameStore } from '../stores/gameStore';
import { roleGuideData, nightResolutionSteps } from '../data/roleGuideData';
import { roleSvgMap } from '../data/roleIllustrations';
import { mockModes } from '../data/modes';

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isPlayerView: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const { t } = useI18n();
const store = useGameStore();

const activeTab = ref('roles'); // 'roles' | 'flowchart' | 'rules'
const searchQuery = ref('');
const selectedFaction = ref('all'); // 'all' | 'town' | 'mafia' | 'third-party'
const filterOnlyActiveMatch = ref(false);

// Active roles in match if in-game
const activeMatchRoleIds = computed(() => {
  if (!store.livePlayers || store.livePlayers.length === 0) return [];
  const ids = new Set();
  store.livePlayers.forEach((p) => {
    if (p.role?.id) ids.add(p.role.id);
  });
  return Array.from(ids);
});

// Current mode info
const currentMode = computed(() => {
  const modeId = store.gameMode || 'godfather';
  return mockModes.find((m) => m.id === modeId) || mockModes[0];
});

// Filtered roles list
const filteredRoles = computed(() => {
  return roleGuideData.filter((role) => {
    // 1. Match active game filter
    if (filterOnlyActiveMatch.value && activeMatchRoleIds.value.length > 0) {
      if (!activeMatchRoleIds.value.includes(role.id)) return false;
    }

    // 2. Faction filter
    if (selectedFaction.value !== 'all' && role.sideId !== selectedFaction.value) {
      return false;
    }

    // 3. Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const roleName = t(role.nameKey).toLowerCase();
      const roleDesc = t(role.descKey).toLowerCase();
      const abilityNames = role.abilities.map((a) => t(a.nameKey).toLowerCase()).join(' ');
      const abilityDescs = role.abilities.map((a) => t(a.descKey).toLowerCase()).join(' ');
      return (
        roleName.includes(q) ||
        roleDesc.includes(q) ||
        abilityNames.includes(q) ||
        abilityDescs.includes(q)
      );
    }

    return true;
  });
});

const getFactionBorderColor = (sideId) => {
  if (sideId === 'mafia') return 'border-red-500/50 bg-red-950/20';
  if (sideId === 'town') return 'border-emerald-500/50 bg-emerald-950/20';
  return 'border-purple-500/50 bg-purple-950/20';
};

const getFactionBadgeClass = (sideId) => {
  if (sideId === 'mafia') return 'bg-red-900/80 text-red-200 border-red-700/60';
  if (sideId === 'town') return 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60';
  return 'bg-purple-900/80 text-purple-200 border-purple-700/60';
};

const getAbilityTypeClass = (typeColor) => {
  switch (typeColor) {
    case 'red':
      return 'bg-red-900/60 text-red-300 border-red-700/50';
    case 'emerald':
      return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
    case 'blue':
      return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
    case 'purple':
      return 'bg-purple-900/60 text-purple-300 border-purple-700/50';
    case 'amber':
    case 'yellow':
      return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
    case 'cyan':
      return 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50';
    default:
      return 'bg-gray-800 text-gray-300 border-gray-700';
  }
};

const getStepColorClass = (color) => {
  switch (color) {
    case 'amber':
      return 'border-amber-500/40 bg-amber-950/20 text-amber-300';
    case 'purple':
      return 'border-purple-500/40 bg-purple-950/20 text-purple-300';
    case 'emerald':
      return 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
    case 'red':
      return 'border-red-500/40 bg-red-950/20 text-red-300';
    case 'blue':
      return 'border-blue-500/40 bg-blue-950/20 text-blue-300';
    case 'yellow':
      return 'border-yellow-500/40 bg-yellow-950/20 text-yellow-300';
    default:
      return 'border-gray-700 bg-gray-900/50 text-gray-300';
  }
};
</script>

<template>
  <BaseModal :is-open="isOpen" max-width="max-w-4xl" @close="emit('close')">
    <template #title>
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">📖</span>
        <div>
          <h3 class="text-lg sm:text-xl font-black text-white">
            {{ $t('roleGuide.title') }}
          </h3>
          <p class="text-xs text-gray-400 font-normal">
            {{ $t('roleGuide.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <!-- NAVIGATION TABS -->
      <div class="flex flex-wrap gap-2 border-b border-gray-700/80 pb-3">
        <button
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="
            activeTab === 'roles'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white'
          "
          @click="activeTab = 'roles'"
        >
          {{ $t('roleGuide.tabs.roles') }}
        </button>

        <button
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="
            activeTab === 'flowchart'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white'
          "
          @click="activeTab = 'flowchart'"
        >
          {{ $t('roleGuide.tabs.flowchart') }}
        </button>

        <button
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="
            activeTab === 'rules'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white'
          "
          @click="activeTab = 'rules'"
        >
          {{ $t('roleGuide.tabs.rules') }}
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: ROLES & ABILITIES HIERARCHY TREE    -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'roles'" class="space-y-4">
        <!-- FILTER & SEARCH CONTROLS -->
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <!-- SEARCH BAR -->
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('roleGuide.searchPlaceholder')"
              class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              v-if="searchQuery"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-white text-xs"
              @click="searchQuery = ''"
            >
              ✕
            </button>
          </div>

          <!-- FACTION FILTER PILLS -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer"
              :class="
                selectedFaction === 'all'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200'
              "
              @click="selectedFaction = 'all'"
            >
              {{ $t('roleGuide.factions.all') }}
            </button>
            <button
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border"
              :class="
                selectedFaction === 'town'
                  ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-emerald-300'
              "
              @click="selectedFaction = 'town'"
            >
              🟢 {{ $t('roleGuide.factions.town') }}
            </button>
            <button
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border"
              :class="
                selectedFaction === 'mafia'
                  ? 'bg-red-900/60 border-red-500 text-red-200'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-red-300'
              "
              @click="selectedFaction = 'mafia'"
            >
              🔴 {{ $t('roleGuide.factions.mafia') }}
            </button>
            <button
              class="px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer border"
              :class="
                selectedFaction === 'third-party'
                  ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-purple-300'
              "
              @click="selectedFaction = 'third-party'"
            >
              🟣 {{ $t('roleGuide.factions.thirdParty') }}
            </button>
          </div>
        </div>

        <!-- ACTIVE MATCH TOGGLE (if active game has seated players) -->
        <div
          v-if="activeMatchRoleIds.length > 0"
          class="flex items-center gap-2 text-xs bg-gray-900/80 p-2.5 rounded-xl border border-gray-700/60"
        >
          <button
            class="px-3 py-1 rounded-lg font-bold transition-all cursor-pointer"
            :class="
              filterOnlyActiveMatch
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            "
            @click="filterOnlyActiveMatch = !filterOnlyActiveMatch"
          >
            {{
              filterOnlyActiveMatch
                ? $t('roleGuide.filterActive', { count: activeMatchRoleIds.length })
                : $t('roleGuide.filterAll', { count: roleGuideData.length })
            }}
          </button>
          <span class="text-gray-400 text-[11px]">
            {{
              filterOnlyActiveMatch
                ? '⚡ Showing only roles seated in this game'
                : '📖 Showing full database of roles'
            }}
          </span>
        </div>

        <!-- ROLE CARDS LIST -->
        <div v-if="filteredRoles.length > 0" class="space-y-4">
          <div
            v-for="role in filteredRoles"
            :key="role.id"
            class="rounded-2xl p-4 sm:p-5 border transition-all space-y-3.5"
            :class="getFactionBorderColor(role.sideId)"
          >
            <!-- ROLE HEADER (AVATAR + NAME + FACTION) -->
            <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 p-1 flex items-center justify-center shadow-inner"
                  v-html="roleSvgMap[role.svgKey]"
                ></div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-base sm:text-lg font-black text-white">
                      {{ $t(role.nameKey) }}
                    </h4>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                      :class="getFactionBadgeClass(role.sideId)"
                    >
                      {{ $t(role.badgeKey) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-300 mt-0.5 leading-relaxed">
                    {{ $t(role.descKey) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ABILITIES BREAKDOWN ($a_1, a_2, ...) -->
            <div class="space-y-2 pt-1 border-t border-gray-700/50">
              <div
                class="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Abilities & Action System ({{ role.abilities.length }})</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  v-for="(ability, idx) in role.abilities"
                  :key="ability.id"
                  class="bg-gray-900/90 rounded-xl p-3 border border-gray-750 space-y-1.5"
                >
                  <div class="flex items-center justify-between gap-1.5 flex-wrap">
                    <div class="flex items-center gap-1.5">
                      <span class="text-base">{{ ability.icon }}</span>
                      <span class="text-xs font-black text-white">
                        a{{ idx + 1 }}: {{ $t(ability.nameKey) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-1">
                      <!-- TYPE BADGE -->
                      <span
                        class="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                        :class="getAbilityTypeClass(ability.typeColor)"
                      >
                        {{ $t(ability.typeKey) }}
                      </span>
                      <!-- PRIORITY PILL -->
                      <span
                        class="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-gray-800 text-amber-300 border border-amber-500/30"
                      >
                        Prio {{ ability.priority }}
                      </span>
                    </div>
                  </div>

                  <!-- ABILITY DESCRIPTION -->
                  <p class="text-[11px] text-gray-300 leading-relaxed">
                    {{ $t(ability.descKey) }}
                  </p>

                  <!-- CONSTRAINTS & CHARGES -->
                  <div
                    class="flex items-center gap-2 pt-1 text-[10px] text-gray-400 border-t border-gray-800"
                  >
                    <span class="bg-gray-800/80 px-1.5 py-0.5 rounded font-mono text-gray-300">
                      {{ $t(ability.chargesKey) }}
                    </span>
                    <span v-if="ability.selfAllowed" class="text-emerald-400 font-semibold">
                      ✓ Self-Target Allowed
                    </span>
                    <span v-else class="text-amber-400/80"> ✗ Others Only </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- TACTICAL PRO-TIP -->
            <div
              class="bg-gray-950/70 rounded-xl p-2.5 border border-amber-500/20 text-xs flex items-start gap-2"
            >
              <span class="text-amber-400 text-sm">💡</span>
              <div class="text-amber-200/90 text-[11px] leading-relaxed">
                <strong class="text-amber-300">Strategic Rule & Tip:</strong>
                {{ $t(role.tacticsKey) }}
              </div>
            </div>
          </div>
        </div>

        <!-- NO MATCH FOUND STATE -->
        <div
          v-else
          class="text-center py-10 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-2"
        >
          <span class="text-3xl">🔍</span>
          <p class="text-sm font-semibold text-gray-400">
            {{ $t('roleGuide.noRolesFound') }}
          </p>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: NIGHT PRIORITY RESOLUTION FLOWCHART -->
      <!-- ========================================== -->
      <div v-else-if="activeTab === 'flowchart'" class="space-y-4">
        <div class="bg-gray-900/80 rounded-2xl p-4 border border-indigo-500/30 space-y-1">
          <h4 class="text-sm sm:text-base font-black text-indigo-200 flex items-center gap-2">
            <span>🌙</span>
            <span>{{ $t('roleGuide.flowchartTitle') }}</span>
          </h4>
          <p class="text-xs text-gray-400">
            {{ $t('roleGuide.flowchartSubtitle') }}
          </p>
        </div>

        <!-- VERTICAL LADDER FLOW -->
        <div
          class="space-y-3 relative pl-4 sm:pl-6 border-l-2 border-indigo-600/40 my-4 ml-2 sm:ml-4"
        >
          <div
            v-for="item in nightResolutionSteps"
            :key="item.step"
            class="relative rounded-2xl p-3.5 sm:p-4 border transition-all space-y-2 shadow-md"
            :class="getStepColorClass(item.color)"
          >
            <!-- NODE BULLET ON TIMELINE -->
            <div
              class="absolute -left-[25px] sm:-left-[33px] top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 border-2 border-indigo-500 flex items-center justify-center text-xs font-black text-indigo-300 shadow"
            >
              {{ item.step }}
            </div>

            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ item.icon }}</span>
                <h5 class="text-xs sm:text-sm font-extrabold text-white">
                  {{ $t(item.titleKey) }}
                </h5>
              </div>

              <span
                class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-900/90 text-amber-300 border border-amber-500/40"
              >
                Prio {{ item.priority }}
              </span>
            </div>

            <p class="text-xs text-gray-300 leading-relaxed">
              {{ $t(item.descKey) }}
            </p>

            <!-- ACTORS BADGES -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[10px] text-gray-400 font-semibold">Active Roles:</span>
              <span
                v-for="actor in item.actors"
                :key="actor"
                class="text-[10px] px-2 py-0.5 rounded-lg bg-gray-800/90 text-gray-200 border border-gray-700 font-mono capitalize"
              >
                {{ actor }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: SCENARIO & TOURNAMENT RULES         -->
      <!-- ========================================== -->
      <div v-else-if="activeTab === 'rules'" class="space-y-4">
        <div class="bg-gray-900/90 rounded-2xl p-5 border border-gray-750 space-y-4">
          <div class="flex items-center justify-between gap-2 border-b border-gray-800 pb-3">
            <div>
              <h4 class="text-base font-black text-white">
                {{ $t(currentMode.nameKey) }}
              </h4>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ $t('roleGuide.scenarioDetails') }}
              </p>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600/50"
            >
              🏆 Mode Specs
            </span>
          </div>

          <!-- GRID OF TIMINGS & PARAMETERS -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center space-y-1">
              <div class="text-[10px] font-bold text-gray-400 uppercase">
                {{ $t('modeSelection.speechTime') }}
              </div>
              <div class="text-lg font-black text-white font-mono">
                {{ currentMode.timeToTalk }}s
              </div>
            </div>

            <div class="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center space-y-1">
              <div class="text-[10px] font-bold text-gray-400 uppercase">
                {{ $t('modeSelection.challengeTime') }}
              </div>
              <div class="text-lg font-black text-amber-400 font-mono">
                {{ currentMode.borrowedTimeToTalk }}s
              </div>
            </div>

            <div class="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center space-y-1">
              <div class="text-[10px] font-bold text-gray-400 uppercase">
                {{ $t('modeSelection.defenseTime') }}
              </div>
              <div class="text-lg font-black text-cyan-400 font-mono">
                {{ currentMode.defenseTimeToTalk }}s
              </div>
            </div>

            <div class="bg-gray-950 p-3 rounded-xl border border-gray-800 text-center space-y-1">
              <div class="text-[10px] font-bold text-gray-400 uppercase">Voting Threshold</div>
              <div class="text-xs font-bold text-emerald-400 mt-1 uppercase font-mono">
                ⌈ Alive / 2 ⌉
              </div>
            </div>
          </div>

          <!-- CORE TOURNAMENT RULES -->
          <div class="space-y-2.5 pt-2">
            <h5 class="text-xs font-extrabold text-gray-300 uppercase tracking-wider">
              Fundamental Tournament Rulings
            </h5>

            <ul class="space-y-2 text-xs text-gray-300 leading-relaxed list-disc list-inside">
              <li>
                <strong class="text-white">Day Turn Rotation:</strong> Each morning, speech starting
                position rotates clockwise by
                <code class="text-amber-400 font-mono">+{{ currentMode.nextDayShift }}</code>
                positions.
              </li>
              <li>
                <strong class="text-white">Godfather Armor & Clean Inquiries:</strong> The Godfather
                survives exactly 1 lethal night shot and always returns innocent to Detective
                inquiries.
              </li>
              <li>
                <strong class="text-white">Leon (Vigilante) Guilt Penalty:</strong> If Leon shoots
                an innocent citizen or town member, Leon dies at sunrise and the target lives.
              </li>
              <li>
                <strong class="text-white">Constantine Single Revive:</strong> Constantine can
                revive 1 dead player back to life before sunrise (1 charge per game).
              </li>
              <li>
                <strong class="text-white">Nostradamus Victory Condition:</strong> Nostradamus must
                predict the winning side on Night 1 and wins alongside that side if they achieve
                victory.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL FOOTER -->
    <template #footer>
      <button
        class="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
        @click="emit('close')"
      >
        {{ $t('common.close') || 'Close Guide' }}
      </button>
    </template>
  </BaseModal>
</template>
