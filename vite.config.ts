import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mqtt') || id.includes('peerjs')) {
              return 'vendor-multiplayer';
            }
            if (id.includes('sweetalert2') || id.includes('qrcode.vue')) {
              return 'vendor-ui';
            }
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor-vue';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
