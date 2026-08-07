<template>
  <div class="bg-gray-900 rounded-lg p-6 border border-indigo-900 shadow-2xl shadow-indigo-900/20">
    <h2 class="text-xl font-bold text-indigo-400 mb-4">
      {{ $t('nightPhase.title') }} (Night {{ store.currentDay }})
    </h2>
    <p class="text-gray-400 mb-6 text-sm">{{ $t('nightPhase.subtitle') }}</p>

    <div v-if="!resolution" class="space-y-6">
      <div
        v-for="actor in actorsWithAbilities"
        :key="actor.name"
        class="bg-gray-800 p-4 rounded-lg border-l-4 border-indigo-500"
      >
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold text-white">
            {{ actor.role.name }}
            <span class="text-gray-500 text-sm font-normal">({{ actor.name }})</span>
          </h3>
          <span class="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded"
            >Priority: {{ getAbilityPriority(actor) }}</span
          >
        </div>

        <select
          v-model="actionMap[actor.name]"
          class="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option :value="null">{{ $t('nightPhase.noAction') }}</option>
          <option v-for="target in getValidTargets(actor)" :key="target.name" :value="target.name">
            {{ target.name }}
          </option>
        </select>
      </div>

      <div class="pt-6 flex justify-end">
        <button
          class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded font-bold shadow-md transition-all"
          @click="processNight"
        >
          {{ $t('nightPhase.resolveNight') }}
        </button>
      </div>
    </div>

    <!-- RESOLUTION RESULTS -->
    <div v-else class="space-y-6">
      <div class="bg-gray-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold text-white mb-2">{{ $t('nightPhase.publicAnnouncement') }}</h3>
        <div
          v-if="resolution.deaths.length === 0"
          class="text-green-400 font-bold p-3 bg-gray-700 rounded text-center"
        >
          {{ $t('nightPhase.noDeaths') }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="death in resolution.deaths"
            :key="death"
            class="text-red-400 font-bold p-3 bg-gray-700 rounded text-center"
          >
            💀 {{ death }} {{ $t('nightPhase.wasKilled') }}
          </div>
        </div>
      </div>

      <div class="bg-gray-800 p-4 rounded-lg">
        <h3 class="text-lg font-bold text-white mb-2">{{ $t('nightPhase.moderatorLog') }}</h3>
        <ul class="space-y-1 text-sm font-mono text-gray-400">
          <li
            v-for="(log, idx) in resolution.log"
            :key="idx"
            class="p-1 border-b border-gray-700 last:border-0"
          >
            > {{ log }}
          </li>
        </ul>
      </div>

      <div class="pt-6 flex justify-end">
        <button
          class="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded font-bold shadow-md transition-all"
          @click="startNextDay"
        >
          {{ $t('nightPhase.startNextDay') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { mockAbilities } from '../../data/abilities';
import { resolveNight } from '../../services/gameEngine';
import { useGameStore } from '../../stores/gameStore';

const store = useGameStore();

const actionMap = ref({});
const resolution = ref(null);

const alivePlayers = computed(() => store.livePlayers.filter((p) => !p.isDead));

// Filter out roles that don't have active abilities (like basic Citizens/Mafia Grunts)
const actorsWithAbilities = computed(() => {
  return alivePlayers.value.filter((p) => {
    const abilities = p.role.abilityIds || [];
    return abilities.length > 0; // Has at least 1 active ability
  });
});

const getAbilityPriority = (player) => {
  const abilityId = player.role.abilityIds[0];
  const ability = mockAbilities.find((a) => a.id === abilityId);
  return ability ? ability.priority : 'N/A';
};

const getValidTargets = (actor) => {
  const abilityId = actor.role.abilityIds[0];
  const ability = mockAbilities.find((a) => a.id === abilityId);

  // E.g. Revive targets dead people
  if (ability && ability.id === 'revive') {
    return store.livePlayers.filter((p) => p.isDead);
  }

  // E.g. Doctor can target self (sometimes limit 1, but handled loosely here)
  if (ability && ability.target.self > -1) {
    return alivePlayers.value;
  }

  // Default: alive players excluding self
  return alivePlayers.value.filter((p) => p.name !== actor.name);
};

const processNight = () => {
  resolution.value = resolveNight(store.livePlayers, actionMap.value);
};

const startNextDay = () => {
  // Commit state changes to Pinia store
  resolution.value.deaths.forEach((name) => {
    store.setPlayerDeathStatus(name, true);
  });

  resolution.value.revived.forEach((name) => {
    store.setPlayerDeathStatus(name, false);
  });

  store.proceedToNextDay();
};
</script>
