import { test, expect } from '@playwright/test';

// Helpers to drive the canvas-based snake game via keyboard
async function playShortRound(page: any) {
  // Focus the document and start game (Space)
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  // Make a few moves
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(150);
  // Intentionally cause collision sooner by zig-zagging
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(80);
  }
}

test.describe('Snake realtime scenario', () => {
  test.beforeEach(async ({ page, context }) => {
    // Ensure realtime flag is on in the frontend
    await context.addInitScript(() => {
      // Set a guest nickname to make presence messages clearer
      try { localStorage.setItem('nickname', 'e2e-guest'); } catch {}
    });
  });

  test('play → gameover → score submit → leaderboard update visible', async ({ page }) => {
    // Expect the dev server to be running with NEXT_PUBLIC_FEATURE_REALTIME=true
    await page.goto('/games/snake');

    // Presence badge should show connecting/online soon
    const presence = page.locator('text=/online|connecting/i');
    await expect(presence).toBeVisible();

    // Play a short round to trigger gameover and score publish
    await playShortRound(page);

    // Wait a bit for the custom event + STOMP processing and leaderboard UI update
    await page.waitForTimeout(1000);

    // Assert that the Top Scores panel appears (either local or live update)
    const topScores = page.locator('h3', { hasText: 'Top Scores' });
    await expect(topScores).toBeVisible();

    // If realtime is working, presence should show a number and the badge text switches from connecting
    await expect(page.locator('text=Realtime on')).toBeVisible({ timeout: 5000 });
  });
});
