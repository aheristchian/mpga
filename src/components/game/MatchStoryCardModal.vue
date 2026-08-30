<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('storyCard.modalTitle')"
    max-width="max-w-xl"
    @close="$emit('close')"
  >
    <div class="space-y-4 py-1 text-center">
      <p class="text-xs text-gray-400">
        {{ $t('storyCard.subtitle') }}
      </p>

      <!-- CARD CANVAS PREVIEW -->
      <div
        class="relative flex justify-center items-center bg-gray-950 p-3 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden max-h-[60vh]"
      >
        <canvas
          ref="canvasRef"
          width="1080"
          height="1920"
          class="w-auto h-[55vh] max-w-full rounded-xl shadow-2xl border border-gray-700 object-contain"
        ></canvas>
      </div>

      <!-- SHARING ACTION BUTTONS -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          @click="downloadCard"
        >
          <span>📥</span>
          <span>{{ $t('storyCard.downloadPng') }}</span>
        </button>

        <button
          v-if="canShare"
          class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          @click="shareCard"
        >
          <span>📲</span>
          <span>{{ $t('storyCard.shareStory') }}</span>
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '../BaseModal.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  winner: {
    type: String,
    default: 'town',
  },
  survivors: {
    type: Array,
    default: () => [],
  },
  currentDay: {
    type: Number,
    default: 1,
  },
  totalPlayers: {
    type: Number,
    default: 0,
  },
});

defineEmits(['close']);

const { locale } = useI18n();
const canvasRef = ref(null);
const canShare = ref(typeof navigator !== 'undefined' && !!navigator.share);

const renderCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  const height = 1920;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Background Gradient
  const isTown = props.winner === 'town';
  const isMafia = props.winner === 'mafia';

  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (isTown) {
    bgGrad.addColorStop(0, '#0a1128');
    bgGrad.addColorStop(0.4, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
  } else if (isMafia) {
    bgGrad.addColorStop(0, '#3f0c0c');
    bgGrad.addColorStop(0.4, '#1c0707');
    bgGrad.addColorStop(1, '#030712');
  } else {
    bgGrad.addColorStop(0, '#2e1065');
    bgGrad.addColorStop(0.4, '#0f051d');
    bgGrad.addColorStop(1, '#030712');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative Atmospheric Particles / Glow Circles
  ctx.save();
  const glow = ctx.createRadialGradient(width / 2, 450, 50, width / 2, 450, 400);
  if (isTown) {
    glow.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    glow.addColorStop(1, 'rgba(59, 130, 246, 0)');
  } else if (isMafia) {
    glow.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
  } else {
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
    glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
  }
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 900);
  ctx.restore();

  // Top App Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 32px Vazirmatn, Inter, sans-serif';
  ctx.fillText('MAFIA PARTY GAME ASSISTANT', width / 2, 140);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 24px Vazirmatn, Inter, sans-serif';
  ctx.fillText('Official Match Summary', width / 2, 185);

  // Big Trophy / Crown Icon
  ctx.font = '140px sans-serif';
  ctx.fillText(isTown ? '🏆' : isMafia ? '👑' : '🔮', width / 2, 380);

  // Victory Title
  ctx.fillStyle = isTown ? '#60a5fa' : isMafia ? '#f87171' : '#c084fc';
  ctx.font = '900 68px Vazirmatn, Inter, sans-serif';
  const victoryTitle = isTown
    ? locale.value === 'fa'
      ? 'پیروزی شهروندان'
      : 'TOWN VICTORY'
    : isMafia
      ? locale.value === 'fa'
        ? 'پیروزی مافیا'
        : 'MAFIA VICTORY'
      : 'THIRD PARTY VICTORY';
  ctx.fillText(victoryTitle, width / 2, 490);

  // Subtitle
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 32px Vazirmatn, Inter, sans-serif';
  const subtitle = isTown
    ? locale.value === 'fa'
      ? 'تمام اعضای مافیا شناسایی و حذف شدند'
      : 'All Mafia members have been eradicated.'
    : locale.value === 'fa'
      ? 'مافیا اکثریت مطلق شهر را به دست گرفت'
      : 'Mafia seized control of the city.';
  ctx.fillText(subtitle, width / 2, 550);

  // Match Stats Card Container
  const statsY = 620;
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(100, statsY, 880, 180, 24);
  ctx.fill();
  ctx.stroke();

  // Stats Columns
  const col1X = 240;
  const col2X = 540;
  const col3X = 840;

  // Stat 1: Total Days
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px Vazirmatn, Inter, sans-serif';
  ctx.fillText(locale.value === 'fa' ? 'تعداد روزها' : 'ROUNDS / DAYS', col1X, statsY + 65);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 52px Vazirmatn, Inter, sans-serif';
  ctx.fillText(`${props.currentDay}`, col1X, statsY + 130);

  // Stat 2: Total Players
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px Vazirmatn, Inter, sans-serif';
  ctx.fillText(locale.value === 'fa' ? 'کل بازیکنان' : 'TOTAL PLAYERS', col2X, statsY + 65);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 52px Vazirmatn, Inter, sans-serif';
  ctx.fillText(`${props.totalPlayers}`, col2X, statsY + 130);

  // Stat 3: Survivors
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 24px Vazirmatn, Inter, sans-serif';
  ctx.fillText(locale.value === 'fa' ? 'بازماندگان' : 'SURVIVORS', col3X, statsY + 65);
  ctx.fillStyle = '#4ade80';
  ctx.font = '900 52px Vazirmatn, Inter, sans-serif';
  ctx.fillText(`${props.survivors.length}`, col3X, statsY + 130);

  // Survivors Header
  const survHeaderY = 870;
  ctx.fillStyle = '#f1f5f9';
  ctx.font = '900 36px Vazirmatn, Inter, sans-serif';
  ctx.fillText(
    locale.value === 'fa' ? '🛡️ بازماندگان نبرد' : '🛡️ SURVIVING HEROES',
    width / 2,
    survHeaderY
  );

  // Survivors Grid List
  const startGridY = 920;
  const list = props.survivors.slice(0, 8); // Render up to 8 survivors
  const cardWidth = 420;
  const cardHeight = 110;
  const gapX = 40;
  const gapY = 20;

  list.forEach((player, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 100 + col * (cardWidth + gapX);
    const y = startGridY + row * (cardHeight + gapY);

    // Card background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = player.role?.sideId === 'mafia' ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, cardWidth, cardHeight, 18);
    ctx.fill();
    ctx.stroke();

    // Player Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Vazirmatn, Inter, sans-serif';
    ctx.fillText(player.name, x + 30, y + 48);

    // Player Role
    ctx.fillStyle = player.role?.sideId === 'mafia' ? '#f87171' : '#60a5fa';
    ctx.font = '600 24px Vazirmatn, Inter, sans-serif';
    const roleName = player.role?.name || 'Citizen';
    ctx.fillText(roleName, x + 30, y + 84);
  });

  // Footer Watermark
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 24px Vazirmatn, Inter, sans-serif';
  ctx.fillText(
    '⚡ Play Mafia like a pro with MPGA (github.com/aheristchian/mpga)',
    width / 2,
    1820
  );
};

const downloadCard = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `mpga-story-day${props.currentDay}-${props.winner}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

const shareCard = async () => {
  const canvas = canvasRef.value;
  if (!canvas || !navigator.share) return;
  try {
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'mpga-match-story.png', { type: 'image/png' });
      await navigator.share({
        title: 'MPGA Match Story',
        text: `Match Ended! ${props.winner.toUpperCase()} Victory in Day ${props.currentDay}!`,
        files: [file],
      });
    });
  } catch {
    // Sharing cancelled or failed
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      nextTick(() => {
        renderCanvas();
      });
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    renderCanvas();
  }
});
</script>
