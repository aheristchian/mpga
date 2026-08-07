<template>
  <div class="w-full max-w-5xl mx-auto">
    <!-- Dashboard Header -->
    <div
      class="mb-8 flex justify-between items-center bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
    >
      <div>
        <h2 class="text-3xl font-bold text-green-500 mb-1">{{ $t('gameModerator.boardTitle') }}</h2>
        <p class="text-gray-400">
          {{ players.length }} {{ $t('playerEntry.currentPlayers') }} | {{ aliveCount }}
          {{ $t('gameModerator.statusAlive') }}
        </p>
      </div>
      <!-- Future: Day/Night Phase toggle could go here -->
    </div>

    <!-- The Player Grid (Seated Order) -->
    <div class="mb-4">
      <h3 class="text-xl font-bold text-gray-300 border-b border-gray-700 pb-2 mb-4">
        {{ $t('gameModerator.seatedOrder') }}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(player, index) in players"
          :key="index"
          class="relative p-5 rounded-lg border-l-4 shadow-md transition-all"
          :class="[
            getSideBorderColor(player.role.sideId),
            player.isAlive !== false ? 'bg-gray-800' : 'bg-gray-900 opacity-60 grayscale',
          ]"
        >
          <!-- Seat Number & Name -->
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2">
              <span class="bg-gray-700 text-gray-300 text-xs font-black px-2 py-1 rounded-full">
                #{{ index + 1 }}
              </span>
              <span
                class="text-xl font-bold text-white"
                :class="{ 'line-through text-gray-500': player.isAlive === false }"
              >
                {{ player.name }}
              </span>
            </div>

            <!-- Alive/Dead Status -->
            <span
              v-if="player.isAlive === false"
              class="text-xs font-bold text-red-500 uppercase bg-red-900/30 px-2 py-1 rounded"
            >
              {{ $t('gameModerator.statusEliminated') }}
            </span>
          </div>

          <!-- Role Info -->
          <div class="mb-4">
            <span
              class="inline-block px-3 py-1 bg-gray-900 rounded text-sm tracking-wider uppercase font-semibold"
              :class="getSideTextColor(player.role.sideId)"
            >
              {{ player.role.name }}
            </span>
          </div>

          <!-- Actions (Placeholder for future logic) -->
          <div class="pt-3 border-t border-gray-700 flex justify-end">
            <!-- We will build actual ability targeting later, for now just simple kill/revive -->
            <button
              v-if="player.isAlive !== false"
              class="text-xs font-bold px-3 py-1.5 rounded bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
              @click="toggleLifeStatus(index)"
            >
              {{ $t('gameModerator.eliminate') }}
            </button>
            <button
              v-else
              class="text-xs font-bold px-3 py-1.5 rounded bg-green-900/50 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
              @click="toggleLifeStatus(index)"
            >
              {{ $t('gameModerator.revive') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  players: {
    type: Array,
    required: true,
  },
});

// Calculate how many players are still alive
const aliveCount = computed(() => {
  return props.players.filter((p) => p.isAlive !== false).length;
});

// A simple mutation for now. In a full app, this might emit to the parent.
const toggleLifeStatus = (index) => {
  const player = props.players[index];
  // If isAlive isn't explicitly set yet, assume they are alive, so make them dead (false)
  if (player.isAlive === undefined) {
    player.isAlive = false;
  } else {
    player.isAlive = !player.isAlive;
  }
};

const getSideBorderColor = (sideId) => {
  if (sideId === 'town') return 'border-town';
  if (sideId === 'mafia') return 'border-mafia';
  return 'border-thirdParty';
};

const getSideTextColor = (sideId) => {
  if (sideId === 'town') return 'text-town';
  if (sideId === 'mafia') return 'text-mafia';
  return 'text-thirdParty';
};
</script>
