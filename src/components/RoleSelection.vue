<template>
  <div class="w-full max-w-6xl mx-auto">
    <div
      class="mb-6 flex flex-wrap justify-between items-end gap-3 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-50 py-4 border-b border-gray-800"
    >
      <div>
        <h2 class="text-3xl font-bold text-white mb-2">{{ $t('roleSelection.title') }}</h2>
        <p class="text-gray-400">
          <i18n-t keypath="roleSelection.playerCountText" tag="span">
            <template #count>
              <span class="font-bold text-white">{{ playerCount }}</span>
            </template>
          </i18n-t>
        </p>
      </div>
      <div
        class="text-xl font-bold p-3 rounded-lg transition-colors"
        :class="
          totalSelected === playerCount
            ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
            : 'bg-gray-800 text-gray-300'
        "
      >
        {{ $t('roleSelection.selectedCount', { selected: totalSelected, total: playerCount }) }}
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <div
        class="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-town rounded-full mb-4"
      ></div>
      <p class="text-gray-400">{{ $t('roleSelection.loading') }}</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-900 border border-red-500 text-red-200 p-4 rounded-lg text-center"
    >
      {{ error }}
    </div>

    <div v-else class="space-y-12">
      <section
        v-for="group in rolesGroupedBySide"
        :key="group.side.id"
        class="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <div class="flex items-center mb-6 border-b border-gray-700 pb-2">
          <h3
            class="text-2xl font-bold uppercase tracking-widest"
            :class="getTextColorClass(group.side.id)"
          >
            {{ $te('sides.' + group.side.id + '.name') ? $t('sides.' + group.side.id + '.name') : group.side.name }}
          </h3>
          <span class="ml-4 text-sm font-semibold text-gray-400 bg-gray-900 px-3 py-1 rounded-full">
            {{ $t('roleSelection.sideSelected', { count: getSideSelectedCount(group.side.id) }) }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="role in group.roles"
            :key="role.id"
            class="relative transition-all duration-300 rounded-xl p-4 border-4 select-none flex flex-col justify-between active:scale-95"
            :class="getCardClasses(role)"
            @click="incrementRole(role)"
          >
            <div>
              <div class="flex justify-between items-start mb-1">
                <h4 class="text-xl font-bold shadow-sm">
                  {{ $te('roles.' + role.id + '.name') ? $t('roles.' + role.id + '.name') : role.name }}
                </h4>
                <span class="text-xs font-bold opacity-50 bg-black/30 px-2 py-1 rounded">
                  {{ $t('roleSelection.maxLimit', { limit: role.limit || 1 }) }}
                </span>
              </div>
              <p class="text-sm opacity-90 line-clamp-3 mb-2">
                {{ $te('roles.' + role.id + '.description') ? $t('roles.' + role.id + '.description') : role.description }}
              </p>
            </div>

            <div
              v-if="getCount(role.id) > 0"
              class="absolute -top-3 -right-3 flex items-center shadow-lg"
            >
              <div
                class="bg-white text-gray-900 rounded-l-full w-8 h-8 flex items-center justify-center font-black text-lg border-2 border-white z-10"
              >
                {{ getCount(role.id) }}
              </div>
              <button
                class="bg-red-500 hover:bg-red-600 active:scale-90 text-white rounded-r-full h-8 px-2 flex items-center justify-center font-bold text-sm border-2 border-l-0 border-white transition-all cursor-pointer select-none"
                :title="$t('roleSelection.clearAll')"
                @click.stop="clearRole(role.id)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-8 flex flex-col sm:flex-row justify-end border-t border-gray-700 pt-6">
      <button
        :disabled="totalSelected !== playerCount"
        class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg min-h-[44px] select-none text-center"
        :class="
          totalSelected === playerCount
            ? 'bg-town hover:bg-blue-600 active:scale-95 active:brightness-90 text-white cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        "
        @click="confirmRoles"
      >
        {{ $t('roleSelection.assignRandomly') }}
      </button>
    </div>

    <BaseModal
      :is-open="showLimitModal"
      :title="$t('roleSelection.limitReachedTitle')"
      @close="showLimitModal = false"
    >
      <div class="text-center py-4">
        <p class="text-lg text-white mb-2">
          <i18n-t keypath="roleSelection.limitReachedWarning" tag="span">
            <template #count>
              <span class="font-bold text-town">{{ playerCount }}</span>
            </template>
          </i18n-t>
        </p>
        <p class="text-gray-400">{{ $t('roleSelection.limitReachedSubWarning') }}</p>
      </div>
      <template #footer>
        <button
          class="px-5 py-2 bg-town hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          @click="showLimitModal = false"
        >
          {{ $t('roleSelection.gotIt') }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :is-open="showBalanceModal"
      :title="$t('roleSelection.balanceWarningTitle')"
      @close="showBalanceModal = false"
    >
      <div class="text-center py-4 space-y-4">
        <div class="text-yellow-500 text-5xl mb-2">⚖️</div>
        <p class="text-lg text-white font-bold">{{ $t('roleSelection.balanceWarningMain') }}</p>
        <p v-if="balanceWarningMessage" class="text-gray-400">
          {{ $t('roleSelection.balanceWarningMessage', balanceWarningMessage) }}
        </p>
      </div>
      <template #footer>
        <button
          class="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          @click="showBalanceModal = false"
        >
          {{ $t('roleSelection.adjustRoles') }}
        </button>
        <button
          class="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
          @click="executeRoleConfirmation"
        >
          {{ $t('roleSelection.proceedAnyway') }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGameService } from '../services/useGameService';
import { useGameStore } from '../stores/gameStore';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  playerCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['roles-confirmed']);

const { roles, sides, modes, isLoading, error, fetchGameData } = useGameService();

const roleCounts = ref({});
const showLimitModal = ref(false);

// Balance Warning State
const showBalanceModal = ref(false);
const balanceWarningMessage = ref('');
const pendingRolesToEmit = ref([]);

onMounted(async () => {
  await fetchGameData();
});

const store = useGameStore();

// Helper to safely get the count
const getCount = (roleId) => {
  return roleCounts.value[roleId] || 0;
};

// Filter roles strictly by the selected game mode
const availableRoles = computed(() => {
  if (!roles.value.length) return [];
  const activeModeId = store.gameMode?.id || 'godfather';
  return roles.value.filter((role) => {
    return role.modeIds ? role.modeIds.includes(activeModeId) : true;
  });
});

// Sums up all the values in the dictionary
const totalSelected = computed(() => {
  return Object.values(roleCounts.value).reduce((sum, count) => sum + count, 0);
});

// COMPUTED: Group the available roles by their Side for rendering
const rolesGroupedBySide = computed(() => {
  if (!availableRoles.value.length || !sides.value.length) return [];
  const groups = sides.value.map((side) => {
    return {
      side: side,
      roles: availableRoles.value.filter((role) => role.sideId === side.id),
    };
  });
  return groups.filter((group) => group.roles.length > 0);
});

const getSideSelectedCount = (sideId) => {
  let count = 0;
  availableRoles.value.forEach((role) => {
    if (role.sideId === sideId) {
      count += getCount(role.id);
    }
  });
  return count;
};

const incrementRole = (role) => {
  const currentCount = getCount(role.id);
  const maxLimit = role.limit || 1;

  if (currentCount >= maxLimit) {
    roleCounts.value[role.id] = 0;
    return;
  }

  if (totalSelected.value >= props.playerCount) {
    showLimitModal.value = true;
    return;
  }

  roleCounts.value[role.id] = currentCount + 1;
};

const clearRole = (roleId) => {
  roleCounts.value[roleId] = 0;
};

const getTextColorClass = (sideId) => {
  if (sideId === 'town') return 'text-town';
  if (sideId === 'mafia') return 'text-mafia';
  return 'text-thirdParty';
};

const getCardClasses = (role) => {
  const count = getCount(role.id);
  const isGlobalMaxed = totalSelected.value >= props.playerCount;

  let baseClass;
  if (role.sideId === 'town') baseClass = 'bg-town border-town';
  else if (role.sideId === 'mafia') baseClass = 'bg-mafia border-mafia';
  else baseClass = 'bg-thirdParty border-thirdParty';

  if (count > 0) {
    return `${baseClass} opacity-100 shadow-xl ring-2 ring-white scale-[1.02] cursor-pointer`;
  } else if (isGlobalMaxed) {
    return `${baseClass} opacity-40 cursor-not-allowed grayscale-[50%]`;
  } else {
    return `${baseClass} opacity-70 hover:opacity-90 cursor-pointer`;
  }
};

// 1. Triggered when the user clicks the "Assign" button
const confirmRoles = () => {
  if (totalSelected.value !== props.playerCount) return;

  // Prepare the raw array
  const finalRolesArray = [];
  for (const [roleId, count] of Object.entries(roleCounts.value)) {
    const fullRoleObject = roles.value.find((r) => r.id === roleId);
    if (fullRoleObject) {
      for (let i = 0; i < count; i++) {
        finalRolesArray.push(fullRoleObject);
      }
    }
  }

  // --- VALIDATION INTERCEPTOR ---
  const store = useGameStore();
  const currentMode = store.gameMode || modes.value[0];
  const rules = currentMode?.balanceRules?.warnIfSideExceedsRatio;

  if (rules) {
    const restrictedSideCount = getSideSelectedCount(rules.sideId);
    const actualRatio = restrictedSideCount / props.playerCount;

    if (actualRatio > rules.maxRatio) {
      // It failed validation! Setup the warning using i18n
      const sideName = sides.value.find((s) => s.id === rules.sideId)?.name || rules.sideId;
      const recommendedMax = Math.floor(props.playerCount * rules.maxRatio);

      // Note: In a full i18n setup, we would inject `t` from `useI18n()`
      // but since this string is reactive, we can just bind it in the template directly
      // However, to keep it clean, we'll store the payload and let the template translate it
      balanceWarningMessage.value = {
        selectedCount: restrictedSideCount,
        sideName: sideName,
        totalPlayers: props.playerCount,
        recommendedMax: recommendedMax,
      };

      // Save the array and show the modal
      pendingRolesToEmit.value = finalRolesArray;
      showBalanceModal.value = true;
      return;
    }
  }

  // If it passes validation, execute immediately
  pendingRolesToEmit.value = finalRolesArray;
  executeRoleConfirmation();
};

// 2. Actually emits the event to App.vue
const executeRoleConfirmation = () => {
  showBalanceModal.value = false;
  emit('roles-confirmed', pendingRolesToEmit.value);
};
</script>
