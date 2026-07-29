import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

const APP_DIR = path.resolve(__dirname, "../../app");

function findPageFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...findPageFiles(full));
    else if (entry === "page.tsx") out.push(full);
  }
  return out;
}

describe("SEO metadata coverage", () => {
  const pages = findPageFiles(APP_DIR);

  it("finds every route", () => {
    expect(pages.length).toBeGreaterThanOrEqual(15);
  });

  it("every page exports metadata or generateMetadata", () => {
    const missing = pages.filter((file) => {
      const src = readFileSync(file, "utf-8");
      return !/export\s+(const|async function)\s+(metadata|generateMetadata)/.test(
        src
      );
    });
    // Detail routes previously shared one generic title across ~40 pages
    expect(missing.map((f) => path.relative(APP_DIR, f))).toEqual([]);
  });

  it("the root layout sets metadataBase so OG image URLs are absolute", () => {
    const layout = readFileSync(path.join(APP_DIR, "layout.tsx"), "utf-8");
    expect(layout).toMatch(/metadataBase/);
    // Must be configurable per-deployment, not hardcoded to one host
    expect(layout).toMatch(/NEXT_PUBLIC_SITE_URL/);
  });

  it("ships a statically-generated Open Graph image", () => {
    const og = readFileSync(
      path.join(APP_DIR, "opengraph-image.tsx"),
      "utf-8"
    );
    // `output: export` requires the route be explicitly static
    expect(og).toMatch(/export const dynamic = "force-static"/);
    expect(og).toMatch(/1200/);
    expect(og).toMatch(/630/);
  });
});

describe("analytics", () => {
  it("is opt-in — no provider is active without configuration", () => {
    const src = readFileSync(
      path.resolve(__dirname, "../../components/layout/analytics.tsx"),
      "utf-8"
    );
    // Both providers must be env-gated, and the default path returns nothing
    expect(src).toMatch(/NEXT_PUBLIC_PLAUSIBLE_DOMAIN/);
    expect(src).toMatch(/NEXT_PUBLIC_UMAMI_WEBSITE_ID/);
    expect(src).toMatch(/return null/);
  });
});
