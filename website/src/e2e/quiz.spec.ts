import { test, expect } from "@playwright/test";

test.describe("Module Quiz", () => {
  test("module page shows a knowledge check quiz", async ({ page }) => {
    await page.goto("/learn/module-1");

    await expect(
      page.getByRole("heading", { name: /Knowledge Check/i })
    ).toBeVisible();

    // Questions render as radio groups with options
    const options = page.getByRole("radio");
    await expect(options.first()).toBeVisible();

    // Submit is disabled until all questions are answered
    const submit = page.getByRole("button", { name: /Submit Answers/i });
    await expect(submit).toBeDisabled();
  });

  test("answering all questions enables submit and shows results", async ({
    page,
  }) => {
    await page.goto("/learn/module-1");

    const radioGroups = page.getByRole("radiogroup");
    const count = await radioGroups.count();
    expect(count).toBeGreaterThan(0);

    // Answer every question with its first option
    for (let i = 0; i < count; i++) {
      await radioGroups.nth(i).getByRole("radio").first().click();
    }

    const submit = page.getByRole("button", { name: /Submit Answers/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // A score summary and retake button appear
    await expect(page.getByRole("status")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Retake Quiz/i })
    ).toBeVisible();
  });
});
