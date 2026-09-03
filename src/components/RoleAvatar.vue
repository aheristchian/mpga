<template>
  <div class="flex flex-col items-center select-none" :class="{ 'opacity-50 grayscale': isDead }">
    <div
      class="relative rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-xl overflow-hidden p-0.5"
      :class="[sizeClasses, sideBorderClasses, sideBgClasses]"
    >
      <!-- ROLE VECTOR ILLUSTRATION (SVG) -->
      <div
        v-if="svgContent"
        class="w-full h-full flex items-center justify-center"
        v-html="svgContent"
      ></div>

      <!-- EMOJI FALLBACK -->
      <span v-else :class="iconSizeClasses">{{ roleIcon }}</span>

      <!-- DEAD OVERLAY BADGE -->
      <div
        v-if="isDead"
        class="absolute inset-0 bg-black/75 rounded-full flex items-center justify-center text-red-500 font-extrabold backdrop-blur-[1px]"
        :class="iconSizeClasses"
      >
        💀
      </div>
    </div>

    <!-- OPTIONAL NAME & SIDE LABELS -->
    <div v-if="showName" class="mt-1.5 text-center">
      <p
        class="font-bold text-white text-xs truncate max-w-[100px]"
        :class="{ 'line-through text-gray-500': isDead }"
      >
        {{ (role?.nameKey && $te(role.nameKey)) ? $t(role.nameKey) : (role?.name || role?.id || $t('gameModerator.unassignedRole')) }}
      </p>
      <p
        v-if="showSide"
        class="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
        :class="sideTextClass"
      >
        {{ role?.sideId || 'town' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getRoleIllustration } from '../data/roleIllustrations';
import type { Role } from '../types';

interface Props {
  role?: Role | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isDead?: boolean;
  showName?: boolean;
  showSide?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  role: null,
  size: 'md',
  isDead: false,
  showName: false,
  showSide: false,
});

const svgContent = computed(() => {
  if (!props.role?.id) return null;
  return getRoleIllustration(props.role.id);
});

const roleIcon = computed(() => {
  const roleId = props.role?.id;
  switch (roleId) {
    case 'godfather':
      return '🎩';
    case 'matador':
      return '🧣';
    case 'saul-goodman':
      return '💼';
    case 'mafia':
      return '🕶️';
    case 'doctor':
      return '💉';
    case 'detective':
      return '🔍';
    case 'citizen':
      return '👤';
    case 'nostradamus':
      return '🔮';
    case 'constantine':
      return '✨';
    case 'leon':
      return '🎯';
    case 'zodiac':
      return '🏹';
    case 'bodyguard':
      return '🛡️';
    case 'silencer':
      return '🤐';
    case 'priest':
      return '🕊️';
    case 'zero-day':
      return '💻';
    case 'botnet-op':
      return '📡';
    case 'phisher':
      return '🎣';
    case 'black-hat':
      return '👾';
    case 'firewall-server':
      return '🛡️';
    case 'sec-analyst':
      return '🔍';
    case 'white-hat':
      return '⚡';
    case 'devops-admin':
      return '🔑';
    case 'sys-user':
      return '👤';
    case 'rogue-ai':
      return '🤖';
    default:
      return '🎭';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8 text-xs border';
    case 'lg':
      return 'w-16 h-16 text-2xl border-2';
    case 'xl':
      return 'w-24 h-24 text-4xl border-3';
    case 'hero':
      return 'w-32 h-32 text-5xl border-4 shadow-2xl';
    case 'md':
    default:
      return 'w-12 h-12 text-base border-2';
  }
});

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-2xl';
    case 'xl':
      return 'text-4xl';
    case 'hero':
      return 'text-6xl';
    case 'md':
    default:
      return 'text-lg';
  }
});

const sideBorderClasses = computed(() => {
  const side = props.role?.sideId;
  if (side === 'mafia') return 'border-red-500 shadow-red-500/20 ring-2 ring-red-900/40';
  if (side === 'third-party')
    return 'border-purple-500 shadow-purple-500/20 ring-2 ring-purple-900/40';
  return 'border-blue-500 shadow-blue-500/20 ring-2 ring-blue-900/40';
});

const sideBgClasses = computed(() => {
  const side = props.role?.sideId;
  if (side === 'mafia') return 'bg-gradient-to-br from-red-950 via-gray-900 to-black';
  if (side === 'third-party') return 'bg-gradient-to-br from-purple-950 via-gray-900 to-black';
  return 'bg-gradient-to-br from-blue-950 via-gray-900 to-black';
});

const sideTextClass = computed(() => {
  const side = props.role?.sideId;
  if (side === 'mafia') return 'text-red-400';
  if (side === 'third-party') return 'text-purple-400';
  return 'text-blue-400';
});
</script>
