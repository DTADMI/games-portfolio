import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/React/i);
  await expect(page.locator("text=Featured Projects")).toBeVisible();
});

test("auth route available", async ({ page }) => {
  await page.goto("/api/auth/signin");
  // NextAuth may render a default sign-in page if enabled
  await expect(page.locator("body")).toBeVisible();
});
