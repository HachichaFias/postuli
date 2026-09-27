import { test, expect } from "@playwright/test";

// Scaffold smoke test: the app boots and serves its home page. s01 replaces the page it checks.
test("home page responds", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
});
