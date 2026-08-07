import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
