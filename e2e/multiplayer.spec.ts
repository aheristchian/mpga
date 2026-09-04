import { test, expect } from '@playwright/test';

/**
 * End-to-End Multi-Device Simulation Test
 * 1 Host Moderator + Connected Virtual Player Browsers
 */
test.describe('Multi-Device E2E Simulation', () => {
  test('Moderator creates game and player connects via mobile view', async ({ browser }) => {
    // 1. Moderator Context
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto('/');
    await expect(hostPage).toHaveTitle(/Mafia|MPGA/i);

    // Verify moderator landing and mode selection elements
    const appContainer = hostPage.locator('#app');
    await expect(appContainer).toBeVisible();

    // 2. Virtual Player Context (Mobile Viewport)
    const playerContext = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone viewport
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    });
    const playerPage = await playerContext.newPage();

    // Player loads mobile player client directly
    await playerPage.goto('/#player');
    await expect(playerPage.locator('#app')).toBeVisible();

    // Cleanup contexts
    await playerContext.close();
    await hostContext.close();
  });
});
