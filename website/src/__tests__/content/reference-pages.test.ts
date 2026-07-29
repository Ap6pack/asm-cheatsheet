import { describe, it, expect } from "vitest";
import { extractReferencePages } from "@/lib/content/extractors";

describe("extractReferencePages", () => {
  const pages = extractReferencePages();

  it("publishes the manifest's pages", () => {
    expect(pages.length).toBeGreaterThanOrEqual(10);
  });

  it("every page resolves to real, non-empty content", () => {
    for (const page of pages) {
      expect(page.content.trim().length).toBeGreaterThan(0);
      expect(page.title.length).toBeGreaterThan(0);
      expect(page.description.length).toBeGreaterThan(0);
      expect(page.category.length).toBeGreaterThan(0);
    }
  });

  it("slugs are unique and URL-safe", () => {
    const slugs = pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("surfaces the previously orphaned high-value content", () => {
    const slugs = pages.map((p) => p.slug);
    // These files existed in the repo but had no page on the site
    expect(slugs).toContain("getting-started");
    expect(slugs).toContain("security-considerations");
    expect(slugs).toContain("advanced-techniques");
    expect(slugs).toContain("docker-quickstart");
    expect(slugs).toContain("change-tracking");
    expect(slugs).toContain("screenshot-tools");
  });
});
