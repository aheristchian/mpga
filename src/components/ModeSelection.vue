<template>
  <div class="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
    <h2 class="text-2xl font-bold text-white mb-4 text-center">{{ $t('modeSelection.title') }}</h2>
    <p class="text-gray-400 mb-6 text-center text-sm">{{ $t('modeSelection.subtitle') }}</p>

    <div class="space-y-4">
      <button
        v-for="mode in availableModes"
        :key="mode.id"
        class="w-full text-left bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-town p-4 rounded-lg transition-all"
        :class="{ 'ring-2 ring-town bg-gray-600': selectedModeId === mode.id }"
        @click="selectedModeId = mode.id"
      >
        <h3 class="text-lg font-bold text-white">{{ $t(mode.nameKey) }}</h3>
        <div class="text-sm text-gray-400 mt-1 flex gap-4">
          <span>⏱️ {{ mode.timeToTalk }}s</span>
          <span>🔄 {{ mode.borrowedTimeToTalk }}s</span>
        </div>
      </button>
    </div>

    <div class="mt-8 flex justify-end">
      <button
        :disabled="!selectedModeId"
        class="bg-town hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-bold shadow-md transition-all"
        @click="confirmMode"
      >
        {{ $t('modeSelection.continue') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameService } from '../services/useGameService';

const emit = defineEmits(['mode-selected']);
const { modes, fetchGameData } = useGameService();
const availableModes = ref([]);
const selectedModeId = ref(null);

onMounted(async () => {
  await fetchGameData();
  availableModes.value = modes.value;
});

const confirmMode = () => {
  if (selectedModeId.value) {
    const selectedMode = availableModes.value.find((m) => m.id === selectedModeId.value);
    emit('mode-selected', selectedMode);
  }
};
</script>
