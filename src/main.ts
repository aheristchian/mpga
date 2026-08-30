import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import en from './locales/en.json';
import fa from './locales/fa.json';

const savedLocale = localStorage.getItem('mpga_locale') || 'en';
document.documentElement.dir = savedLocale === 'fa' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLocale;

// Setup i18n instance
export const i18n = createI18n({
  legacy: false, // Must be false to use Vue 3 Composition API
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    fa,
  },
});

const pinia = createPinia();
const app = createApp(App);

app.use(i18n); // Register i18n plugin
app.use(pinia); // Register Pinia plugin
app.mount('#app');
