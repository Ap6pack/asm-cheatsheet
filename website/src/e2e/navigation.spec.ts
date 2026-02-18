import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads with ASM Cheatsheet title", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /ASM Cheatsheet/i })
    ).toBeVisible();
  });

  test("/learn page loads with modules", async ({ page }) => {
    await page.goto("/learn");
    await expect(
      page.getByRole("heading", { name: /Learning Path/i })
    ).toBeVisible();
    // Verify at least one module card is rendered
    await expect(page.locator("text=Module 1")).toBeVisible();
  });

  test("/commands page loads with command categories", async ({ page }) => {
    await page.goto("/commands");
    await expect(
      page.getByRole("heading", { name: /Command/i }).first()
    ).toBeVisible();
  });

  test("/tools page loads with tool cards", async ({ page }) => {
    await page.goto("/tools");
    await expect(
      page.getByRole("heading", { name: /Tools/i }).first()
    ).toBeVisible();
  });

  test("/workflows page loads", async ({ page }) => {
    await page.goto("/workflows");
    await expect(
      page.getByRole("heading", { name: /Workflow/i }).first()
    ).toBeVisible();
  });

  test("/scenarios page loads", async ({ page }) => {
    await page.goto("/scenarios");
    await expect(
      page.getByRole("heading", { name: /Scenario/i }).first()
    ).toBeVisible();
  });

  test("navigation links work from header", async ({ page }) => {
    await page.goto("/");

    // Click Learn nav link
    await page.getByRole("link", { name: "Learn" }).first().click();
    await expect(page).toHaveURL(/\/learn/);
    await expect(
      page.getByRole("heading", { name: /Learning Path/i })
    ).toBeVisible();

    // Click Commands nav link
    await page.getByRole("link", { name: "Commands" }).first().click();
    await expect(page).toHaveURL(/\/commands/);

    // Click Tools nav link
    await page.getByRole("link", { name: "Tools" }).first().click();
    await expect(page).toHaveURL(/\/tools/);

    // Click Workflows nav link
    await page.getByRole("link", { name: "Workflows" }).first().click();
    await expect(page).toHaveURL(/\/workflows/);

    // Click Scenarios nav link
    await page.getByRole("link", { name: "Scenarios" }).first().click();
    await expect(page).toHaveURL(/\/scenarios/);

    // Navigate back to homepage via logo
    await page.getByRole("link", { name: /ASM Cheatsheet/i }).first().click();
    await expect(page).toHaveURL("/");
  });
});
