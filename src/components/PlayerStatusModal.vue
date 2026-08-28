<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('playerStatusModal.title', { name: player?.name || '' })"
    @close="$emit('close')"
  >
    <div v-if="player" class="space-y-6">
      <!-- PLAYER IDENTITY SUMMARY -->
      <div class="flex items-center gap-4 bg-gray-700/60 p-4 rounded-lg border border-gray-600">
        <RoleAvatar :role="player.role" :is-dead="isDeadLocal" size="lg" />
        <div>
          <h4 class="text-xl font-bold text-white">{{ player.name }}</h4>
          <p class="text-sm font-semibold" :class="getSideColorClass(player.role?.sideId)">
            {{
              $te('roles.' + player.role?.id + '.name')
                ? $t('roles.' + player.role?.id + '.name')
                : player.role?.name || 'Unknown Role'
            }}
          </p>
          <div class="flex gap-2 mt-2">
            <span
              v-if="isDeadLocal"
              class="text-xs bg-red-900/50 border border-red-700 text-red-300 px-2 py-0.5 rounded font-bold uppercase"
            >
              💀 {{ $t('gameModerator.statusEliminated') }}
            </span>
            <span
              v-else
              class="text-xs bg-green-900/50 border border-green-700 text-green-300 px-2 py-0.5 rounded font-bold uppercase"
            >
              💚 {{ $t('gameModerator.statusAlive') }}
            </span>
            <span
              v-if="warningsLocal > 0"
              class="text-xs bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-2 py-0.5 rounded font-bold"
            >
              ⚠️ {{ $t('gameModerator.warningsCount', { count: warningsLocal }) }}
            </span>
            <span
              v-if="isSilencedLocal"
              class="text-xs bg-purple-900/50 border border-purple-700 text-purple-300 px-2 py-0.5 rounded font-bold"
            >
              🤫 {{ $t('gameModerator.silencedBadge') }}
            </span>
          </div>
        </div>
      </div>

      <!-- STATE OVERRIDES: LIFE / DEATH -->
      <div class="space-y-3">
        <h5 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {{ $t('playerStatusModal.statusSection') }}
        </h5>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 min-h-[44px] select-none"
            :class="
              isDeadLocal
                ? 'bg-red-700 border-red-500 text-white shadow-lg ring-2 ring-red-400'
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white'
            "
            @click="isDeadLocal = true"
          >
            <span>💀</span> {{ $t('playerStatusModal.markDead') }}
          </button>
          <button
            type="button"
            class="p-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 min-h-[44px] select-none"
            :class="
              !isDeadLocal
                ? 'bg-green-700 border-green-500 text-white shadow-lg ring-2 ring-green-400'
                : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white'
            "
            @click="isDeadLocal = false"
          >
            <span>💚</span> {{ $t('playerStatusModal.markAlive') }}
          </button>
        </div>
      </div>

      <!-- PENALTIES & DISCIPLINARY -->
      <div class="space-y-3">
        <h5 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {{ $t('playerStatusModal.penaltiesSection') }}
        </h5>
        <div
          class="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg border border-gray-600"
        >
          <div class="flex items-center gap-2">
            <span class="text-yellow-400 font-bold">⚠️ Warnings: {{ warningsLocal }}</span>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3.5 py-2 bg-gray-600 hover:bg-gray-500 active:scale-95 text-white rounded-lg font-bold text-sm cursor-pointer min-h-[40px] select-none"
              :disabled="warningsLocal <= 0"
              @click="warningsLocal = Math.max(0, warningsLocal - 1)"
            >
              {{ $t('playerStatusModal.removeWarning') }}
            </button>
            <button
              type="button"
              class="px-3.5 py-2 bg-yellow-600 hover:bg-yellow-500 active:scale-95 text-white rounded-lg font-bold text-sm cursor-pointer min-h-[40px] select-none"
              @click="warningsLocal++"
            >
              {{ $t('playerStatusModal.addWarning') }}
            </button>
          </div>
        </div>

        <div
          class="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg border border-gray-600"
        >
          <span class="text-purple-300 font-semibold">🤫 Silence Next Day</span>
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer active:scale-95 select-none min-h-[40px]"
            :class="
              isSilencedLocal
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            "
            @click="isSilencedLocal = !isSilencedLocal"
          >
            {{ isSilencedLocal ? 'Active' : 'Inactive' }}
          </button>
        </div>
      </div>

      <!-- REASON FOR OVERRIDE -->
      <div class="space-y-3">
        <h5 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {{ $t('playerStatusModal.reasonSection') }}
        </h5>
        <select
          v-model="selectedReasonPreset"
          class="w-full bg-gray-700 text-white p-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-town min-h-[44px]"
        >
          <option value="modKill">{{ $t('playerStatusModal.reasonPresets.modKill') }}</option>
          <option value="modRevive">{{ $t('playerStatusModal.reasonPresets.modRevive') }}</option>
          <option value="cardEffect">{{ $t('playerStatusModal.reasonPresets.cardEffect') }}</option>
          <option value="ruleBreach">{{ $t('playerStatusModal.reasonPresets.ruleBreach') }}</option>
          <option value="voluntaryExit">
            {{ $t('playerStatusModal.reasonPresets.voluntaryExit') }}
          </option>
          <option value="custom">{{ $t('playerStatusModal.reasonPresets.custom') }}</option>
        </select>

        <input
          v-if="selectedReasonPreset === 'custom'"
          v-model="customReason"
          type="text"
          :placeholder="$t('playerStatusModal.customReasonPlaceholder')"
          class="w-full bg-gray-700 text-white px-3 py-2.5 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-town text-sm min-h-[44px]"
        />
      </div>
    </div>

    <template #footer>
      <button
        class="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-semibold rounded-xl transition-all cursor-pointer min-h-[44px] select-none"
        @click="$emit('close')"
      >
        {{ $t('playerStatusModal.cancel') }}
      </button>
      <button
        class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer min-h-[44px] select-none"
        @click="applyChanges"
      >
        {{ $t('playerStatusModal.saveChanges') }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from './BaseModal.vue';
import RoleAvatar from './RoleAvatar.vue';
import { useGameStore } from '../stores/gameStore';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  player: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);
const store = useGameStore();
const { t } = useI18n();

const isDeadLocal = ref(false);
const warningsLocal = ref(0);
const isSilencedLocal = ref(false);
const selectedReasonPreset = ref('modKill');
const customReason = ref('');

watch(
  () => props.player,
  (newPlayer) => {
    if (newPlayer) {
      isDeadLocal.value = !!newPlayer.isDead;
      warningsLocal.value = newPlayer.warnings || 0;
      isSilencedLocal.value = !!newPlayer.isSilenced;
      selectedReasonPreset.value = newPlayer.isDead ? 'modRevive' : 'modKill';
      customReason.value = '';
    }
  },
  { immediate: true }
);

const getSideColorClass = (sideId) => {
  if (sideId === 'mafia') return 'text-mafia';
  if (sideId === 'third-party') return 'text-thirdParty';
  return 'text-town';
};

const getEffectiveReason = () => {
  if (selectedReasonPreset.value === 'custom') {
    return customReason.value.trim() || t('playerStatusModal.reasonPresets.custom');
  }
  return t(`playerStatusModal.reasonPresets.${selectedReasonPreset.value}`);
};

const applyChanges = () => {
  if (!props.player) return;

  const reason = getEffectiveReason();

  // 1. Update death status if modified
  if (props.player.isDead !== isDeadLocal.value) {
    store.setPlayerDeathStatus(props.player.name, isDeadLocal.value, reason);
  }

  // 2. Update warnings/silence if modified
  const warningDelta = warningsLocal.value - (props.player.warnings || 0);
  const silenceChanged = props.player.isSilenced !== isSilencedLocal.value;

  if (warningDelta !== 0 || silenceChanged) {
    store.applyPenalty(
      props.player.name,
      {
        warningDelta,
        isSilenced: silenceChanged ? isSilencedLocal.value : null,
      },
      reason
    );
  }

  emit('close');
};
</script>
