import { test, expect } from "@playwright/test";

test.describe("Learning Path", () => {
  test("/learn page shows all modules", async ({ page }) => {
    await page.goto("/learn");

    // The page should display the Learning Path heading
    await expect(
      page.getByRole("heading", { name: /Learning Path/i })
    ).toBeVisible();

    // Verify track sections are rendered
    await expect(page.locator("text=Beginner Track")).toBeVisible();
    await expect(page.locator("text=Intermediate Track")).toBeVisible();
    await expect(page.locator("text=Advanced Track")).toBeVisible();

    // Verify at least Module 1 is visible
    await expect(page.locator("text=Module 1").first()).toBeVisible();
  });

  test("clicking a module navigates to detail page", async ({ page }) => {
    await page.goto("/learn");

    // Click the first module card (Module 1)
    await page
      .locator("a[href*='/learn/module-']")
      .first()
      .click();

    // Should navigate to a module detail page
    await expect(page).toHaveURL(/\/learn\/module-/);

    // The detail page should have a heading with the module title
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();
  });

  test("module detail page shows success criteria checkboxes", async ({
    page,
  }) => {
    await page.goto("/learn");

    // Navigate to the first module
    await page
      .locator("a[href*='/learn/module-']")
      .first()
      .click();

    await expect(page).toHaveURL(/\/learn\/module-/);

    // The Success Criteria section should be visible
    await expect(
      page.getByRole("heading", { name: /Success Criteria/i })
    ).toBeVisible();

    // There should be at least one checkbox for success criteria
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes.first()).toBeVisible();
  });
});
