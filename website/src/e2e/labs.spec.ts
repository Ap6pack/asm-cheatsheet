import { test, expect } from "@playwright/test";

// The flagship lab ships the Break-the-Chain challenge and opens in Defend mode.
const FLAGSHIP = "/labs/frontier-lab-agent-intrusion-2026-07";

test.describe("Labs", () => {
  test("/labs catalog lists incident replays", async ({ page }) => {
    await page.goto("/labs");
    await expect(page.getByRole("heading", { name: /^Labs$/ })).toBeVisible();
    await expect(page.locator("a[href^='/labs/']").first()).toBeVisible();
  });

  test("flagship opens in Defend mode with controls", async ({ page }) => {
    await page.goto(FLAGSHIP);
    await expect(
      page.getByRole("heading", { name: /Break the Chain/i })
    ).toBeVisible();
    // Defensive controls and the run button are present
    await expect(
      page.getByText("Isolate the evaluation sandbox")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Run intrusion/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Defensive lessons/i })
    ).toBeVisible();
  });

  test("deploying the top control contains the intrusion at the source", async ({
    page,
  }) => {
    await page.goto(FLAGSHIP);

    // Isolating the eval sandbox is the highest-leverage single control
    await page.getByText("Isolate the evaluation sandbox").click();
    await page.getByRole("button", { name: /Run intrusion/i }).click();

    // The result card resolves to an A+ containment
    await expect(page.getByText(/Contained at the source/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("Watch mode shows the timeline replay and reaches completion", async ({
    page,
  }) => {
    await page.goto(FLAGSHIP);
    await page.getByRole("tab", { name: /Watch/i }).click();

    await expect(
      page.getByText("Attack chain across trust boundaries")
    ).toBeVisible();
    await expect(page.getByText("Phase activity")).toBeVisible();

    const slider = page.getByRole("slider", { name: /Timeline scrubber/i });
    await expect(slider).toBeVisible();
    await slider.focus();
    await slider.press("End");
    await expect(page.getByText(/Replay complete/i)).toBeVisible();
  });
});
