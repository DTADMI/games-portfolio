import { expect, test } from "@playwright/test";

// This test assumes realtime is disabled on FE and/or BE
// FE: run with NEXT_PUBLIC_FEATURE_REALTIME=false
// BE: features.realtimeEnabled=false (or evaluation false)

test.describe("Snake fallback (REST) scenario", () => {
  test("renders leaderboard snapshot when realtime disabled", async ({ page, context }) => {
    // Ensure FE flag is off (env usually set before app loads). Some apps also read NEXT_PUBLIC_* at build time.
    await context.addInitScript(() => {
      try {
        localStorage.removeItem("accessToken");
      } catch {}
    });

    await page.goto("/games/snake");

    // Presence badge should be hidden when realtime flag is off
    await expect(page.getByText(/online|connecting/i)).toHaveCount(0);

    // Play a bit to create a local score and ensure panel renders
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(150);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(150);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(80);
    }

    await page.waitForTimeout(1000);

    const topScores = page.locator("h3", { hasText: "Top Scores" });
    await expect(topScores).toBeVisible();
  });
});
