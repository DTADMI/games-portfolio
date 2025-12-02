import { expect, test } from "@playwright/test";

test.describe("Games smoke", () => {
  test("chess loads and renders a board", async ({ page }) => {
    await page.goto("/games/chess");
    // Wait for at least one board square button to appear
    const square = page.locator('button[aria-label^="Square"]');
    await expect(square.first()).toBeVisible();
  });

  test("checkers loads and renders a board", async ({ page }) => {
    await page.goto("/games/checkers");
    const square = page.locator('button[aria-label^="Square"]');
    await expect(square.first()).toBeVisible();
  });
});
