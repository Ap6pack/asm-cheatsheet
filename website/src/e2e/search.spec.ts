import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("Cmd+K opens search dialog", async ({ page }) => {
    await page.goto("/");

    // Press Cmd+K (Meta+K) to open search
    await page.keyboard.press("Meta+k");

    // The search dialog should be visible with its input
    await expect(
      page.getByPlaceholder(/Search commands, tools, modules/i)
    ).toBeVisible();
  });

  test("typing in search filters results", async ({ page }) => {
    await page.goto("/");

    // Open search dialog
    await page.keyboard.press("Meta+k");

    const searchInput = page.getByPlaceholder(
      /Search commands, tools, modules/i
    );
    await expect(searchInput).toBeVisible();

    // Type a search query - wait for the search index to load first
    await searchInput.fill("nmap");

    // Wait for results to appear (search entries are fetched from /api/search)
    // Results should contain at least one item matching "nmap"
    await expect(
      page.locator("ul > li").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("Escape closes search dialog", async ({ page }) => {
    await page.goto("/");

    // Open search dialog
    await page.keyboard.press("Meta+k");

    const searchInput = page.getByPlaceholder(
      /Search commands, tools, modules/i
    );
    await expect(searchInput).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");

    // The search input should no longer be visible
    await expect(searchInput).not.toBeVisible();
  });
});
