<template>
  <div
    class="relative overflow-hidden rounded-2xl p-6 border shadow-2xl transition-all duration-500 mb-6"
    :class="bannerClasses"
  >
    <!-- BACKGROUND ARTWORK / VECTOR SILHOUETTE -->
    <div class="absolute inset-0 opacity-20 pointer-events-none flex justify-end items-center pr-4">
      <div class="w-64 h-64 max-h-full" v-html="phaseArtwork"></div>
    </div>

    <!-- FOREGROUND CONTENT -->
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">{{ phaseEmoji }}</span>
          <h2 class="text-2xl font-black tracking-wide text-white capitalize">
            {{ title || defaultTitle }}
          </h2>
          <span
            class="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm"
            :class="tagClasses"
          >
            Day {{ day }}
          </span>
        </div>
        <p class="text-sm font-medium opacity-90" :class="subtitleClasses">
          {{ subtitle || defaultSubtitle }}
        </p>
      </div>

      <!-- OPTIONAL ACTION / STATUS SLOT -->
      <div v-if="$slots.action" class="shrink-0 flex items-center">
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  phase: {
    type: String,
    required: true, // 'day', 'voting', 'midday', 'night'
  },
  day: {
    type: Number,
    default: 1,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
});

const phaseEmoji = computed(() => {
  switch (props.phase) {
    case 'day':
      return '☀️';
    case 'voting':
      return '⚖️';
    case 'midday':
      return '🃏';
    case 'night':
      return '🌙';
    default:
      return '🎭';
  }
});

const defaultTitle = computed(() => {
  switch (props.phase) {
    case 'day':
      return t('dayPhase.title');
    case 'voting':
      return t('votingPhase.title');
    case 'midday':
      return t('middayPhase.title');
    case 'night':
      return t('nightPhase.title');
    default:
      return 'Phase';
  }
});

const defaultSubtitle = computed(() => {
  switch (props.phase) {
    case 'day':
      return t('phaseHero.daySlogan');
    case 'voting':
      return t('phaseHero.votingSlogan');
    case 'midday':
      return t('phaseHero.middaySlogan');
    case 'night':
      return t('phaseHero.nightSlogan');
    default:
      return '';
  }
});

const bannerClasses = computed(() => {
  switch (props.phase) {
    case 'day':
      return 'bg-gradient-to-r from-amber-950/90 via-gray-900 to-amber-900/60 border-amber-600/50 shadow-amber-950/40';
    case 'voting':
      return 'bg-gradient-to-r from-orange-950/90 via-gray-900 to-red-900/60 border-orange-600/50 shadow-orange-950/40';
    case 'midday':
      return 'bg-gradient-to-r from-purple-950/90 via-gray-900 to-indigo-900/60 border-purple-600/50 shadow-purple-950/40';
    case 'night':
      return 'bg-gradient-to-r from-indigo-950/90 via-gray-900 to-blue-950/60 border-indigo-600/50 shadow-indigo-950/40';
    default:
      return 'bg-gray-800 border-gray-700';
  }
});

const tagClasses = computed(() => {
  switch (props.phase) {
    case 'day':
      return 'bg-amber-900/80 text-amber-300 border-amber-500';
    case 'voting':
      return 'bg-orange-900/80 text-orange-300 border-orange-500';
    case 'midday':
      return 'bg-purple-900/80 text-purple-300 border-purple-500';
    case 'night':
      return 'bg-indigo-900/80 text-indigo-300 border-indigo-500';
    default:
      return 'bg-gray-700 text-gray-300 border-gray-600';
  }
});

const subtitleClasses = computed(() => {
  switch (props.phase) {
    case 'day':
      return 'text-amber-200/90';
    case 'voting':
      return 'text-orange-200/90';
    case 'midday':
      return 'text-purple-200/90';
    case 'night':
      return 'text-indigo-200/90';
    default:
      return 'text-gray-300';
  }
});

const phaseArtwork = computed(() => {
  switch (props.phase) {
    case 'day':
      return `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <!-- Rising Sun -->
          <circle cx="100" cy="110" r="45" fill="#F59E0B"/>
          <!-- Sun Rays -->
          <line x1="100" y1="35" x2="100" y2="55" stroke="#FDE68A" stroke-width="4" stroke-linecap="round"/>
          <line x1="45" y1="65" x2="60" y2="78" stroke="#FDE68A" stroke-width="4" stroke-linecap="round"/>
          <line x1="155" y1="65" x2="140" y2="78" stroke="#FDE68A" stroke-width="4" stroke-linecap="round"/>
          <!-- City Skyline Silhouettes -->
          <rect x="20" y="110" width="30" height="70" fill="#78350F"/>
          <rect x="55" y="90" width="25" height="90" fill="#451A03"/>
          <rect x="85" y="125" width="40" height="55" fill="#78350F"/>
          <rect x="130" y="80" width="35" height="100" fill="#451A03"/>
          <rect x="170" y="115" width="20" height="65" fill="#78350F"/>
        </svg>
      `;
    case 'voting':
      return `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <!-- Scales of Justice -->
          <line x1="100" y1="40" x2="100" y2="160" stroke="#F97316" stroke-width="6"/>
          <rect x="70" y="155" width="60" height="15" rx="3" fill="#C2410C"/>
          <!-- Scale Beam -->
          <line x1="40" y1="65" x2="160" y2="65" stroke="#FDBA74" stroke-width="5" stroke-linecap="round"/>
          <circle cx="100" cy="65" r="7" fill="#EA580C"/>
          <!-- Left Pan -->
          <line x1="45" y1="65" x2="25" y2="115" stroke="#FDBA74" stroke-width="2"/>
          <line x1="45" y1="65" x2="65" y2="115" stroke="#FDBA74" stroke-width="2"/>
          <path d="M20 115 C20 135 70 135 70 115 Z" fill="#C2410C"/>
          <!-- Right Pan -->
          <line x1="155" y1="65" x2="135" y2="115" stroke="#FDBA74" stroke-width="2"/>
          <line x1="155" y1="65" x2="175" y2="115" stroke="#FDBA74" stroke-width="2"/>
          <path d="M130 115 C130 135 180 135 180 115 Z" fill="#C2410C"/>
        </svg>
      `;
    case 'midday':
      return `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <!-- Hourglass & Twilight Deck -->
          <path d="M60 40 H140 L115 100 L140 160 H60 L85 100 Z" fill="#581C87" stroke="#A855F7" stroke-width="4"/>
          <line x1="50" y1="40" x2="150" y2="40" stroke="#C084FC" stroke-width="6" stroke-linecap="round"/>
          <line x1="50" y1="160" x2="150" y2="160" stroke="#C084FC" stroke-width="6" stroke-linecap="round"/>
          <!-- Sand flow -->
          <polygon points="100,100 85,150 115,150" fill="#E9D5FF"/>
          <circle cx="100" cy="115" r="2" fill="#FAF5FF"/>
          <circle cx="100" cy="125" r="2" fill="#FAF5FF"/>
        </svg>
      `;
    case 'night':
      return `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <!-- Glowing Full Moon -->
          <circle cx="130" cy="70" r="40" fill="#E0E7FF" opacity="0.9"/>
          <circle cx="120" cy="65" r="32" fill="#312E81"/>
          <!-- Mist Clouds -->
          <path d="M30 110 C50 90 90 95 110 110 C130 100 170 105 185 125 C190 140 180 160 160 160 H40 C20 160 15 130 30 110 Z" fill="#1E1B4B" opacity="0.7"/>
          <!-- Streetlamp Silhouette -->
          <line x1="55" y1="90" x2="55" y2="170" stroke="#818CF8" stroke-width="3"/>
          <polygon points="45,90 65,90 55,75" fill="#FDE047"/>
          <circle cx="55" cy="85" r="6" fill="#FEF08A" opacity="0.8"/>
        </svg>
      `;
    default:
      return '';
  }
});
</script>
