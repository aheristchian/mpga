<template>
  <div
    class="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-700 select-none shadow-sm"
  >
    <button
      type="button"
      class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 min-w-[32px]"
      :class="
        currentLocale === 'en'
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
      "
      :title="$t('language.en')"
      @click="setLanguage('en')"
    >
      EN
    </button>
    <button
      type="button"
      class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 min-w-[32px]"
      :class="
        currentLocale === 'fa'
          ? 'bg-emerald-600 text-white shadow-md'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
      "
      :title="$t('language.fa')"
      @click="setLanguage('fa')"
    >
      فا
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

const setLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem('mpga_locale', lang);
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};
</script>
