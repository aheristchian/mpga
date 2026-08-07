<template>
  <div class="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
    <h2 class="text-2xl font-bold text-white mb-4">{{ $t('playerEntry.addPlayers') }}</h2>

    <form class="flex gap-2 mb-6" @submit.prevent="addPlayer">
      <input
        v-model="newPlayerName"
        type="text"
        :placeholder="$t('playerEntry.placeholder')"
        class="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-town transition-all"
      />
      <button
        type="submit"
        :disabled="!newPlayerName.trim()"
        class="bg-town hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold transition-colors"
      >
        {{ $t('playerEntry.add') }}
      </button>
    </form>

    <div v-if="players.length > 0">
      <h3
        class="text-lg font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1 flex justify-between"
      >
        <span>{{ $t('playerEntry.currentPlayers') }} ({{ players.length }})</span>
        <span class="text-sm font-normal text-gray-500">{{
          $t('playerEntry.orderBySeating')
        }}</span>
      </h3>
      <ul class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        <li
          v-for="(player, index) in players"
          :key="index"
          draggable="true"
          class="flex justify-between items-center bg-gray-700 px-3 py-2 rounded group cursor-grab active:cursor-grabbing transition-transform"
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
            <span class="text-gray-500 cursor-grab px-1">☰</span>
            <span class="text-white font-medium">{{ index + 1 }}. {{ player.name }}</span>
          </div>

          <button
            class="text-red-400 hover:text-red-300 text-sm font-medium px-2 py-1 bg-gray-800 rounded hover:bg-gray-600 transition-colors"
            @click="removePlayer(index)"
          >
            {{ $t('playerEntry.remove') }}
          </button>
        </li>
      </ul>
    </div>

    <div v-else class="text-center text-gray-500 py-4 italic">
      {{ $t('playerEntry.noPlayers') }}
    </div>

    <div class="mt-6 flex justify-end">
      <button
        v-if="players.length >= 3"
        class="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold shadow-md transition-all"
        @click="finishAddingPlayers"
      >
        {{ $t('playerEntry.done') }}
      </button>
      <p v-else class="text-sm text-yellow-500">
        {{ $t('playerEntry.needMore') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const players = ref([]);
const newPlayerName = ref('');
const emit = defineEmits(['players-ready']);

// Drag and Drop State
const draggedIndex = ref(null);
const dropTargetIndex = ref(null);

const addPlayer = () => {
  const name = newPlayerName.value.trim();
  if (name) {
    players.value.push({ name: name, role: null });
    newPlayerName.value = '';
  }
};

const removePlayer = (index) => {
  players.value.splice(index, 1);
};

// --- DRAG AND DROP LOGIC ---

// 1. User clicks and holds an item
const onDragStart = (event, index) => {
  draggedIndex.value = index;
  // Required for Firefox to allow dragging
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', index);
};

// 2. User drags item over another item (visual feedback only)
const onDragEnter = (event, index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dropTargetIndex.value = index;
  }
};

// 3. User lets go of the mouse button
const onDrop = (event, index) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    // Standard Javascript trick to move an item within an array
    const itemToMove = players.value.splice(draggedIndex.value, 1)[0];
    players.value.splice(index, 0, itemToMove);
  }
  // Reset state
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

// 4. Cleanup if drag is cancelled (e.g. hitting Escape)
const onDragEnd = () => {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

const finishAddingPlayers = () => {
  emit('players-ready', players.value);
};
</script>

<style scoped>
/* Custom scrollbar for the player list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #374151; /* gray-700 */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563; /* gray-600 */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* gray-500 */
}
</style>
