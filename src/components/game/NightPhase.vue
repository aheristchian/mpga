<template>
  <div class="space-y-6">
    <!-- ATMOSPHERIC HERO BANNER -->
    <PhaseHeroBanner phase="night" :day="store.currentDay">
      <template #action>
        <!-- STEP INDICATOR -->
        <div
          class="flex items-center gap-2 text-xs font-bold bg-gray-900/60 p-1.5 rounded-xl border border-indigo-500/30"
        >
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'sleep' ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-gray-400'
            "
          >
            {{ $t('nightPhase.step1Badge') }}
          </span>
          <span class="text-gray-600">→</span>
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'wizard' ? 'bg-indigo-600 text-white font-black shadow-md' : 'text-gray-400'
            "
          >
            {{ $t('nightPhase.step2Badge') }}
          </span>
          <span class="text-gray-600">→</span>
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'morning'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('nightPhase.step3Badge') }}
          </span>
        </div>
      </template>
    </PhaseHeroBanner>

    <div
      class="bg-gray-850 rounded-2xl p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-950/20 text-white"
    >
      <!-- STAGE 1: SLEEP TOWN CALL -->
      <div
        v-if="stage === 'sleep'"
        class="text-center py-12 space-y-6 bg-gray-900/60 rounded-2xl border border-indigo-500/30 p-8"
      >
        <div class="text-7xl">🌃</div>
        <div class="bg-indigo-950/40 border border-indigo-500/40 p-5 rounded-xl max-w-lg mx-auto">
          <h4 class="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
            Moderator Script Cue
          </h4>
          <p class="text-base text-gray-200 italic leading-relaxed">
            {{ $t('nightPhase.sleepTownPrompt') }}
          </p>
        </div>

        <div class="pt-4">
          <button
            class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-black text-base shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            @click="startRoleWakeupWizard"
          >
            {{
              actorsWithAbilities.length > 0
                ? 'Begin Role Wake-Ups ▶'
                : 'Calculate Night Resolution ▶'
            }}
          </button>
        </div>
      </div>

      <!-- STAGE 2: ROLE WAKEUP TELEPROMPTER WIZARD -->
      <div v-else-if="stage === 'wizard' && currentActor" class="space-y-6">
        <div
          class="bg-gradient-to-b from-gray-800 to-gray-850 p-6 rounded-2xl border-2 border-indigo-500/40 shadow-2xl relative"
        >
          <!-- Progress Counter -->
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">
              {{
                $t('nightPhase.stepProgress', {
                  current: currentActorIndex + 1,
                  total: actorsWithAbilities.length,
                  role: currentActor.role?.name,
                })
              }}
            </span>
            <span class="text-xs bg-indigo-900/60 text-indigo-300 px-3 py-1 rounded-full font-bold">
              {{ $t('nightPhase.priority', { priority: getAbilityPriority(currentActor) }) }}
            </span>
          </div>

          <!-- Role Header Card -->
          <div
            class="flex items-center gap-4 bg-gray-900/70 p-4 rounded-xl border border-gray-700 mb-6"
          >
            <RoleAvatar :role="currentActor.role" size="lg" />
            <div>
              <h3 class="text-2xl font-black text-white">{{ currentActor.role?.name }}</h3>
              <p class="text-sm text-gray-300">
                Player: <span class="font-bold text-white">{{ currentActor.name }}</span>
              </p>
            </div>
          </div>

          <!-- TELEPROMPTER SCRIPT -->
          <div class="space-y-3 mb-6">
            <div class="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-xl">
              <span
                class="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block mb-1"
                >Wake-Up Script</span
              >
              <p class="text-sm text-gray-200 italic">
                {{
                  $t('nightPhase.wakeRolePrompt', {
                    role: currentActor.role?.name,
                    player: currentActor.name,
                  })
                }}
              </p>
            </div>
          </div>

          <!-- TARGET SELECTION -->
          <div class="space-y-2 mb-6">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Select Night Target:
            </label>
            <select
              v-model="actionMap[currentActor.name]"
              class="w-full bg-gray-700 text-white text-base p-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            >
              <option :value="null">{{ $t('nightPhase.noAction') }}</option>
              <option
                v-for="target in getValidTargets(currentActor)"
                :key="target.name"
                :value="target.name"
              >
                {{ target.name }} ({{ target.role?.name }})
              </option>
            </select>
          </div>

          <!-- DETECTIVE INSTANT FEEDBACK -->
          <div
            v-if="currentActor.role?.id === 'detective' && actionMap[currentActor.name]"
            class="bg-blue-950/50 border border-blue-500/50 p-4 rounded-xl space-y-2 mb-6"
          >
            <span class="text-xs text-blue-400 font-bold uppercase tracking-wider block">
              {{ $t('nightPhase.investigationResult') }}
            </span>
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ detectiveInquiryResult?.isGuilty ? '👎' : '👍' }}</span>
              <div>
                <span
                  class="font-black text-lg block"
                  :class="detectiveInquiryResult?.isGuilty ? 'text-red-400' : 'text-green-400'"
                >
                  {{
                    detectiveInquiryResult?.isGuilty
                      ? $t('nightPhase.guiltyMafia')
                      : $t('nightPhase.innocentTown')
                  }}
                </span>
                <p class="text-xs text-gray-300">
                  Signal secretly to Detective without opening eyes of others.
                </p>
              </div>
            </div>
          </div>

          <!-- PUT TO SLEEP SCRIPT -->
          <div
            class="bg-gray-900/60 p-3 rounded-xl border border-gray-700 text-xs text-gray-400 italic mb-6"
          >
            {{ $t('nightPhase.putToSleepPrompt', { role: currentActor.role?.name }) }}
          </div>

          <!-- NAVIGATION CONTROLS -->
          <div class="flex justify-between items-center pt-2">
            <button
              class="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-semibold transition-all text-sm disabled:opacity-30"
              :disabled="currentActorIndex === 0"
              @click="prevRole"
            >
              ← {{ $t('nightPhase.prevRole') }}
            </button>

            <button
              class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              @click="nextRole"
            >
              <span>{{
                currentActorIndex < actorsWithAbilities.length - 1
                  ? $t('nightPhase.nextRole')
                  : $t('nightPhase.reviewActions')
              }}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- STAGE 3: MORNING ANNOUNCEMENT & RESOLUTION RESULTS -->
      <div v-else-if="stage === 'morning' && resolution" class="space-y-6">
        <!-- MORNING TOWN WAKE UP SCRIPT -->
        <div class="bg-indigo-950/40 border-2 border-indigo-500/60 p-5 rounded-2xl">
          <span class="text-xs text-indigo-400 font-bold uppercase tracking-widest block mb-1"
            >Morning Wake-up Script</span
          >
          <p class="text-lg font-bold text-white italic">
            {{ $t('nightPhase.morningTownPrompt') }}
          </p>
        </div>

        <!-- PUBLIC ANNOUNCEMENT -->
        <div class="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-3">
          <h3 class="text-sm font-bold text-gray-300 uppercase tracking-wider">
            {{ $t('nightPhase.publicAnnouncement') }}
          </h3>

          <div
            v-if="resolution.deaths.length === 0"
            class="text-green-400 font-black p-4 bg-green-950/30 border border-green-600/40 rounded-xl text-center text-lg"
          >
            🕊️ {{ $t('nightPhase.noDeaths') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="death in resolution.deaths"
              :key="death"
              class="text-red-400 font-black p-4 bg-red-950/30 border border-red-600/40 rounded-xl text-center text-lg"
            >
              💀 {{ death }} {{ $t('nightPhase.wasKilled') }}
            </div>
          </div>

          <div v-if="resolution.revived && resolution.revived.length > 0" class="space-y-2">
            <div
              v-for="revived in resolution.revived"
              :key="revived"
              class="text-green-400 font-black p-4 bg-green-950/30 border border-green-600/40 rounded-xl text-center text-lg"
            >
              💚 {{ revived }} {{ $t('nightPhase.wasRevived') }}
            </div>
          </div>
        </div>

        <!-- MODERATOR PRIVATE LOG -->
        <div class="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
          <h3 class="text-sm font-bold text-indigo-300 mb-3">
            {{ $t('nightPhase.moderatorLog') }}
          </h3>
          <ul class="space-y-1.5 text-xs font-mono text-gray-300">
            <li
              v-for="(log, idx) in resolution.log"
              :key="idx"
              class="p-1.5 bg-gray-900/60 rounded border border-gray-700/60"
            >
              > {{ log }}
            </li>
          </ul>
        </div>

        <!-- START NEXT DAY -->
        <div class="pt-4 flex justify-end">
          <button
            class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-3.5 rounded-xl font-black text-base shadow-xl shadow-green-600/30 transition-all cursor-pointer"
            @click="startNextDay"
          >
            ☀️ {{ $t('nightPhase.startNextDay', { day: store.currentDay + 1 }) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { mockAbilities } from '../../data/abilities';
import { resolveNight } from '../../services/gameEngine';
import { useGameStore } from '../../stores/gameStore';
import { useAudio } from '../../services/useAudioService';
import PhaseHeroBanner from '../PhaseHeroBanner.vue';
import RoleAvatar from '../RoleAvatar.vue';

const store = useGameStore();
const audio = useAudio();

const stage = ref('sleep'); // 'sleep', 'wizard', 'morning'
const currentActorIndex = ref(0);
const actionMap = ref({});
const resolution = ref(null);

const alivePlayers = computed(() => store.livePlayers.filter((p) => !p.isDead));

const actorsWithAbilities = computed(() => {
  const list = alivePlayers.value.filter((p) => {
    const abilities = p.role?.abilityIds || [];
    return abilities.length > 0;
  });

  return list.sort((a, b) => {
    const prioA = getAbilityPriority(a);
    const prioB = getAbilityPriority(b);
    return prioA - prioB;
  });
});

const currentActor = computed(() => {
  return actorsWithAbilities.value[currentActorIndex.value] || null;
});

const getAbilityPriority = (player) => {
  const abilityId = player.role?.abilityIds?.[0];
  const ability = mockAbilities.find((a) => a.id === abilityId);
  return ability ? ability.priority : 99;
};

const getValidTargets = (actor) => {
  if (!actor || !actor.role?.abilityIds) return [];
  const abilityId = actor.role.abilityIds[0];
  const ability = mockAbilities.find((a) => a.id === abilityId);

  // Revive targets dead players
  if (ability && ability.id === 'revive') {
    return store.livePlayers.filter((p) => p.isDead);
  }

  // Doctor can target self
  if (ability && ability.target?.self > -1) {
    return alivePlayers.value;
  }

  // Default: alive players excluding self
  return alivePlayers.value.filter((p) => p.name !== actor.name);
};

const detectiveInquiryResult = computed(() => {
  if (!currentActor.value || currentActor.value.role?.id !== 'detective') return null;
  const targetName = actionMap.value[currentActor.value.name];
  if (!targetName) return null;

  const targetPlayer = store.livePlayers.find((p) => p.name === targetName);
  if (!targetPlayer) return null;

  // Godfather appears as innocent in inquiry
  const isGodfather = targetPlayer.role?.id === 'godfather';
  const isMafia = targetPlayer.role?.sideId === 'mafia';

  return {
    target: targetName,
    isGuilty: isMafia && !isGodfather,
  };
});

const startRoleWakeupWizard = () => {
  if (actorsWithAbilities.value.length === 0) {
    executeNightResolution();
  } else {
    currentActorIndex.value = 0;
    stage.value = 'wizard';
  }
};

const prevRole = () => {
  if (currentActorIndex.value > 0) {
    currentActorIndex.value--;
  }
};

const nextRole = () => {
  if (currentActorIndex.value < actorsWithAbilities.value.length - 1) {
    currentActorIndex.value++;
  } else {
    executeNightResolution();
  }
};

const executeNightResolution = () => {
  resolution.value = resolveNight(store.livePlayers, actionMap.value);
  stage.value = 'morning';
  audio.playDawnRise();

  store.addLog(
    'night',
    `Night ${store.currentDay} Actions Resolved`,
    `Deaths: ${resolution.value.deaths.length ? resolution.value.deaths.join(', ') : 'None'}. Revived: ${resolution.value.revived.length ? resolution.value.revived.join(', ') : 'None'}.`
  );
};

const startNextDay = () => {
  if (!resolution.value) return;

  // Commit death changes
  resolution.value.deaths.forEach((name) => {
    store.setPlayerDeathStatus(name, true, `Killed during Night ${store.currentDay}`);
  });

  // Commit revive changes
  resolution.value.revived.forEach((name) => {
    store.setPlayerDeathStatus(name, false, `Revived during Night ${store.currentDay}`);
  });

  store.proceedToNextDay();
};

onMounted(() => {
  stage.value = 'sleep';
  actionMap.value = {};
  resolution.value = null;
  audio.playNightFall();
});
</script>
