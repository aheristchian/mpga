<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    @click.self="close"
  >
    <div
      class="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- MODAL HEADER -->
      <div
        class="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gray-950/60"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20"
          >
            🎵
          </div>
          <div>
            <h3 class="text-lg font-black text-white">
              {{ $t('audio.musicConsole') }}
            </h3>
            <p class="text-xs text-gray-400">
              MPGA Atmosphere Soundtrack & Playlist Player
            </p>
          </div>
        </div>
        <button
          class="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          @click="close"
        >
          ✕
        </button>
      </div>

      <!-- SCROLLABLE BODY -->
      <div class="p-6 space-y-5 overflow-y-auto flex-1">
        <!-- NOW PLAYING WIDGET -->
        <div
          class="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
        >
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <div
              class="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl shrink-0"
              :class="{ 'animate-pulse text-purple-400 shadow-md shadow-purple-500/20': audio.isPlayingMusic.value }"
            >
              {{ audio.isPlayingMusic.value ? '📻' : '🔈' }}
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                {{ audio.isPlayingMusic.value ? $t('audio.musicPlaying', { title: '' }) : $t('audio.noTrackPlaying') }}
              </span>
              <h4 class="text-sm font-black text-white truncate max-w-xs sm:max-w-sm">
                {{ audio.currentTrack.value?.title || 'MPGA Soundtrack' }}
              </h4>
              <span class="text-xs text-gray-400">
                {{ audio.currentTrack.value?.artist || 'Ali Heristchian' }}
              </span>
            </div>
          </div>

          <!-- CONTROLS -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              class="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              :title="$t('audio.prev')"
              @click="audio.previousTrack"
            >
              ⏮
            </button>
            <button
              class="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-purple-500/30 transition-all cursor-pointer"
              :title="audio.isPlayingMusic.value ? $t('audio.pause') : $t('audio.play')"
              @click="audio.toggleMusic"
            >
              {{ audio.isPlayingMusic.value ? '⏸' : '▶' }}
            </button>
            <button
              class="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
              :title="$t('audio.next')"
              @click="audio.nextTrack"
            >
              ⏭
            </button>
            <button
              class="w-9 h-9 rounded-lg bg-gray-800 hover:bg-red-900/60 hover:text-red-300 active:scale-95 text-gray-400 flex items-center justify-center transition-all cursor-pointer"
              :title="$t('audio.stop')"
              @click="audio.stopMusic"
            >
              ⏹
            </button>
          </div>
        </div>

        <!-- VOLUME & AUTOPLAY SETTINGS -->
        <div class="bg-gray-800/40 border border-gray-800 p-4 rounded-xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <!-- Music Volume Slider -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <span>🔊</span> {{ $t('audio.musicVolume') }}
                </label>
                <span class="text-xs font-mono font-bold text-purple-400">
                  {{ Math.round(audio.musicVolume.value * 100) }}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="audio.musicVolume.value"
                class="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                @input="audio.setMusicVolume($event.target.value)"
              />
            </div>

            <!-- Auto-DJ Toggle -->
            <div class="flex items-center justify-between gap-2">
              <div>
                <span class="text-xs font-bold text-white block">{{ $t('audio.autoPlayLabel') }}</span>
                <span class="text-[11px] text-gray-400 block leading-tight">{{ $t('audio.autoPlayDesc') }}</span>
              </div>
              <button
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                :class="audio.autoPlayOnPhaseChange.value ? 'bg-purple-600' : 'bg-gray-700'"
                @click="audio.setAutoPlay(!audio.autoPlayOnPhaseChange.value)"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="audio.autoPlayOnPhaseChange.value ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- PHASE PLAYLIST TABS -->
        <div>
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4 border-b border-gray-800">
            <button
              v-for="tab in phaseTabs"
              :key="tab.id"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              :class="
                selectedTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700'
              "
              @click="selectedTab = tab.id"
            >
              <span>{{ tab.icon }}</span>
              <span>{{ $t(tab.labelKey) }}</span>
              <span class="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full">
                {{ (audio.playlists.value[tab.id] || []).length }}
              </span>
            </button>
          </div>

          <!-- TRACKS IN SELECTED CATEGORY -->
          <div class="space-y-2">
            <div
              v-for="track in currentCategoryTracks"
              :key="track.id"
              class="flex items-center justify-between p-3 rounded-xl border transition-all"
              :class="
                audio.currentTrack.value?.id === track.id && audio.isPlayingMusic.value
                  ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
                  : 'bg-gray-800/40 hover:bg-gray-800 border-gray-800'
              "
            >
              <div class="min-w-0 flex-1 pr-3">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    v-if="audio.currentTrack.value?.id === track.id && audio.isPlayingMusic.value"
                    class="text-xs text-purple-400 animate-pulse font-bold"
                  >
                    ▶
                  </span>
                  <h5 class="text-sm font-bold text-white truncate">
                    {{ track.title }}
                  </h5>
                  <span
                    v-if="track.winner === 'mafia'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 border border-red-600/60 text-red-300"
                  >
                    {{ $t('audio.mafiaWinTrack') }}
                  </span>
                  <span
                    v-else-if="track.winner === 'town'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 border border-blue-600/60 text-blue-300"
                  >
                    {{ $t('audio.townWinTrack') }}
                  </span>
                  <span
                    v-else-if="track.winner === 'third-party'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-600/60 text-purple-300"
                  >
                    {{ $t('audio.thirdPartyWinTrack') }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 truncate mt-0.5">
                  {{ track.artist || 'Ali Heristchian' }}
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  :class="
                    audio.currentTrack.value?.id === track.id && audio.isPlayingMusic.value
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  "
                  @click="handleTrackClick(track)"
                >
                  <span>{{ audio.currentTrack.value?.id === track.id && audio.isPlayingMusic.value ? '⏸' : '▶' }}</span>
                  <span>{{ audio.currentTrack.value?.id === track.id && audio.isPlayingMusic.value ? $t('audio.pause') : $t('audio.play') }}</span>
                </button>
              </div>
            </div>

            <div
              v-if="currentCategoryTracks.length === 0"
              class="text-center py-6 text-gray-500 text-xs"
            >
              No tracks configured for this category.
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL FOOTER -->
      <div class="px-6 py-3 border-t border-gray-800 bg-gray-950/80 flex justify-end">
        <button
          class="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          @click="close"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAudio } from '../services/useAudioService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);
const audio = useAudio();

const selectedTab = ref('night');

const phaseTabs = [
  { id: 'night', labelKey: 'audio.phaseNight', icon: '🌙' },
  { id: 'day', labelKey: 'audio.phaseDay', icon: '☀️' },
  { id: 'voting', labelKey: 'audio.phaseVoting', icon: '🗳️' },
  { id: 'midday', labelKey: 'audio.phaseMidday', icon: '⏳' },
  { id: 'victory', labelKey: 'audio.phaseVictory', icon: '🏆' },
  { id: 'lobby', labelKey: 'audio.phaseLobby', icon: '🎲' },
];

const currentCategoryTracks = computed(() => {
  return audio.playlists.value[selectedTab.value] || [];
});

const handleTrackClick = (track) => {
  if (audio.currentTrack.value?.id === track.id && audio.isPlayingMusic.value) {
    audio.pauseMusic();
  } else {
    audio.activePhase.value = selectedTab.value;
    audio.playTrack(track);
  }
};

const close = () => {
  emit('close');
};
</script>
