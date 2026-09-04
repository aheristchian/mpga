import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for MPGA Multi-Device Simulation
 * Tests 1 Moderator Host + N Virtual Player Browser Contexts
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  fullyParallel: false, // Maintain order for multi-device coordination
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --host',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
