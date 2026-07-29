import { test, expect } from "@playwright/test";

test.describe("Labs", () => {
  test("/labs catalog lists incident replays", async ({ page }) => {
    await page.goto("/labs");
    await expect(
      page.getByRole("heading", { name: /^Labs$/ })
    ).toBeVisible();
    // At least one lab card links to a lab detail page
    await expect(page.locator("a[href^='/labs/']").first()).toBeVisible();
  });

  test("a lab page renders the interactive replay", async ({ page }) => {
    await page.goto("/labs");
    await page.locator("a[href^='/labs/']").first().click();
    await expect(page).toHaveURL(/\/labs\/.+/);

    // Core replay furniture is present
    await expect(page.getByText("Attack chain across trust boundaries")).toBeVisible();
    await expect(page.getByText("Phase activity")).toBeVisible();
    await expect(page.getByRole("slider", { name: /Timeline scrubber/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Defensive lessons/i })
    ).toBeVisible();
  });

  test("scrubbing the timeline advances the action counter", async ({
    page,
  }) => {
    await page.goto("/labs");
    await page.locator("a[href^='/labs/']").first().click();

    const slider = page.getByRole("slider", { name: /Timeline scrubber/i });
    await expect(slider).toBeVisible();

    // Drag the scrubber to the end via keyboard (End key on a range input)
    await slider.focus();
    await slider.press("End");

    // The completion banner appears once the playhead reaches the end
    await expect(page.getByText(/Replay complete/i)).toBeVisible();
  });
});
