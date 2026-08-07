import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import en from './locales/en.json';

// Setup i18n instance
const i18n = createI18n({
  legacy: false, // Must be false to use Vue 3 Composition API
  locale: 'en', // Default language
  fallbackLocale: 'en',
  messages: {
    en: en,
  },
});

const pinia = createPinia();
const app = createApp(App);

app.use(i18n); // Register i18n plugin
app.use(pinia); // Register Pinia plugin
app.mount('#app');
