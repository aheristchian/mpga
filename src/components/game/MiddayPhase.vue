<template>
  <div class="space-y-6">
    <!-- ATMOSPHERIC HERO BANNER -->
    <PhaseHeroBanner phase="midday" :day="store.currentDay">
      <template #action>
        <!-- STEP INDICATOR -->
        <div
          class="flex items-center gap-2 text-xs font-bold bg-gray-900/60 p-1.5 rounded-xl border border-purple-500/30"
        >
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'speech'
                ? 'bg-purple-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('middayPhase.step1Badge') }}
          </span>
          <span class="text-gray-600 inline-block rtl:rotate-180 transform transition-transform"
            >→</span
          >
          <span
            class="px-2.5 py-1 rounded-lg transition-colors"
            :class="
              stage === 'card'
                ? 'bg-purple-500 text-gray-950 font-black shadow-md'
                : 'text-gray-400'
            "
          >
            {{ $t('middayPhase.step2Badge') }}
          </span>
        </div>
      </template>
    </PhaseHeroBanner>

    <div
      class="bg-gray-850 rounded-2xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-950/20 text-white"
    >
      <!-- ELIMINATED PLAYER HEADER -->
      <div
        v-if="targetPlayer"
        class="bg-purple-950/30 border border-purple-500/40 p-4 rounded-xl flex items-center gap-4 mb-6"
      >
        <RoleAvatar :role="targetPlayer.role" :is-dead="true" size="lg" />
        <div>
          <span class="text-xs text-purple-400 uppercase font-bold tracking-wider">
            {{ $t('middayPhase.eliminatedFromTown') }}
          </span>
          <h3 class="text-xl font-black text-white">{{ targetPlayer.name }}</h3>
          <p class="text-xs text-gray-300 font-semibold">
            {{ $t('middayPhase.roleLabel') }}: {{ targetPlayer.role?.name || 'Unknown' }} ({{
              targetPlayer.role?.sideId || 'town'
            }})
          </p>
        </div>
      </div>

      <!-- STAGE 1: EXIT SPEECH -->
      <div v-if="stage === 'speech'" class="space-y-6">
        <div
          class="bg-gradient-to-b from-gray-800 to-gray-850 p-6 rounded-2xl border-2 border-purple-500/40 shadow-2xl text-center"
        >
          <h3 class="text-base font-bold text-purple-400 mb-1">
            {{ $t('middayPhase.exitSpeechTitle') }}
          </h3>
          <p class="text-xs text-gray-300 mb-4">{{ $t('middayPhase.isGivingExitSpeech') }}</p>

          <!-- Timer Display -->
          <div
            class="text-7xl font-mono font-black mb-6 tracking-tight drop-shadow-lg transition-colors"
            :class="speechTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'"
          >
            {{ formattedSpeechTime }}
          </div>

          <!-- Controls -->
          <div class="flex flex-wrap justify-center gap-3 mb-4">
            <button
              v-if="!isSpeechRunning && speechTimeLeft > 0"
              class="bg-green-600 hover:bg-green-500 active:scale-95 active:brightness-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px] select-none"
              @click="startSpeechTimer"
            >
              <span>▶</span> {{ $t('dayPhase.start') }}
            </button>
            <button
              v-if="isSpeechRunning"
              class="bg-yellow-600 hover:bg-yellow-500 active:scale-95 active:brightness-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer min-h-[44px] select-none"
              @click="pauseSpeechTimer"
            >
              <span>⏸</span> {{ $t('dayPhase.pause') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] select-none"
              @click="resetSpeechTimer"
            >
              ↺ {{ $t('dayPhase.reset') }}
            </button>
            <button
              class="bg-gray-700 hover:bg-gray-600 active:scale-95 text-gray-200 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer min-h-[44px] select-none"
              @click="speechTimeLeft = Math.max(0, speechTimeLeft + 10)"
            >
              +10s
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-end pt-2">
          <button
            class="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 active:brightness-90 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] select-none"
            @click="proceedToCardStage"
          >
            <span>{{ $t('middayPhase.proceedToCardDraw') }}</span>
            <span>▶</span>
          </button>
        </div>
      </div>

      <!-- STAGE 2: LAST WORD CARD DRAW -->
      <div v-else-if="stage === 'card'" class="space-y-6">
        <div class="bg-gray-800/80 p-5 rounded-xl border border-gray-700">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-base font-bold text-purple-400">
                {{ $t('middayPhase.drawCardTitle') }}
              </h3>
              <p class="text-xs text-gray-300">{{ $t('middayPhase.drawCardSubtitle') }}</p>
            </div>
            <span
              class="text-xs bg-purple-900/60 border border-purple-600 text-purple-300 px-3 py-1 rounded-full font-bold"
            >
              {{ $t('middayPhase.remainingCards', { count: store.lastWordDeck.length }) }}
            </span>
          </div>

          <!-- ROULETTE / DRAWN CARD CONTAINER -->
          <div
            v-if="!drawnCard"
            class="text-center py-12 space-y-6 bg-gray-900/60 rounded-2xl border border-purple-500/30 p-6"
          >
            <div v-if="isSpinning" class="space-y-4">
              <div class="text-6xl animate-bounce">🎲</div>
              <p class="text-xl font-black text-purple-300 tracking-wider font-mono">
                {{ spinningCardName }}
              </p>
            </div>

            <div v-else class="space-y-4">
              <div class="text-6xl">🃏</div>
              <p class="text-gray-300 text-sm max-w-sm mx-auto">
                {{ $t('middayPhase.spinCardPrompt') }}
              </p>
              <button
                class="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 active:scale-95 active:brightness-90 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-purple-600/40 transition-all cursor-pointer min-h-[44px] select-none"
                @click="spinRoulette"
              >
                {{ $t('middayPhase.drawCardBtn') }}
              </button>
            </div>
          </div>

          <!-- REVEALED CARD -->
          <div v-else class="space-y-4">
            <div
              class="p-5 rounded-2xl border-2 border-purple-500/60 bg-gradient-to-br from-purple-950/40 via-gray-900 to-pink-950/30 text-center space-y-2"
            >
              <span class="text-4xl block mb-2">✨</span>
              <h4 class="text-2xl font-black text-white">
                {{ $t(drawnCard.nameKey) }}
              </h4>
              <span class="text-sm font-mono text-purple-400 font-bold uppercase tracking-widest">
                {{ drawnCard.icon }}
              </span>
            </div>

            <div
              class="bg-gray-900/80 p-4 rounded-xl border border-gray-700 text-gray-200 text-sm leading-relaxed"
            >
              {{ $t(drawnCard.descriptionKey) }}
            </div>
          </div>
        </div>

        <!-- PROCEED TO NIGHT -->
        <div class="flex flex-col sm:flex-row justify-end pt-2">
          <button
            class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-black text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] select-none"
            @click="proceedToNight"
          >
            <span>{{ $t('middayPhase.proceedToNight') }}</span>
            <span>🌙</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../../stores/gameStore';
import { useAudio } from '../../services/useAudioService';
import PhaseHeroBanner from '../PhaseHeroBanner.vue';
import RoleAvatar from '../RoleAvatar.vue';
import type { LastWordCard } from '../../types';

const store = useGameStore();
const audio = useAudio();
const { t } = useI18n();

const stage = ref<'speech' | 'card'>('speech');
const speechTimeLeft = ref(45);
const isSpeechRunning = ref(false);
let speechTimerInterval: ReturnType<typeof setInterval> | null = null;

// Card Draw State
const isSpinning = ref(false);
const spinningCardName = ref('');
const drawnCard = ref<LastWordCard | null>(null);

const targetPlayer = computed(() => {
  return store.eliminatedPlayer || store.livePlayers.find((p) => p.isDead) || null;
});

const formattedSpeechTime = computed(() => {
  const m = Math.floor(speechTimeLeft.value / 60);
  const s = speechTimeLeft.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

const startSpeechTimer = () => {
  if (isSpeechRunning.value || speechTimeLeft.value <= 0) return;
  isSpeechRunning.value = true;
  speechTimerInterval = setInterval(() => {
    if (speechTimeLeft.value > 0) {
      speechTimeLeft.value--;
      if (speechTimeLeft.value <= 3 && speechTimeLeft.value > 0) {
        audio.playUrgentTick();
      } else if (speechTimeLeft.value <= 10 && speechTimeLeft.value > 0) {
        audio.playTick();
      } else if (speechTimeLeft.value === 0) {
        audio.playGong();
      }
    } else {
      pauseSpeechTimer();
    }
  }, 1000);
};

const pauseSpeechTimer = () => {
  isSpeechRunning.value = false;
  if (speechTimerInterval) clearInterval(speechTimerInterval);
};

const resetSpeechTimer = () => {
  pauseSpeechTimer();
  speechTimeLeft.value = 45;
};

const proceedToCardStage = () => {
  pauseSpeechTimer();
  stage.value = 'card';
};

const spinRoulette = () => {
  if (store.lastWordDeck.length === 0 || isSpinning.value) return;

  isSpinning.value = true;
  const cards = store.lastWordDeck;
  let spins = 0;
  const maxSpins = 20 + Math.floor(Math.random() * 8);
  let intervalMs = 60;

  const spin = () => {
    const card = cards[spins % cards.length];
    spinningCardName.value = t(card.nameKey);
    audio.playRouletteTick();
    spins++;

    if (spins < maxSpins) {
      if (spins > maxSpins - 8) intervalMs += 40;
      setTimeout(spin, intervalMs);
    } else {
      setTimeout(() => {
        isSpinning.value = false;
        drawnCard.value = store.drawLastWordCard(targetPlayer.value?.name || 'Player');
        audio.playFanfare();
      }, 800);
    }
  };

  spin();
};

const proceedToNight = () => {
  store.setSubPhase('night');
};

onMounted(() => {
  stage.value = 'speech';
  speechTimeLeft.value = 45;
});

onUnmounted(() => {
  pauseSpeechTimer();
});
</script>
