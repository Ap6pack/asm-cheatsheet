import { describe, it, expect } from "vitest";
import { extractTools, extractGuides } from "@/lib/content/extractors";

describe("tool coverage and maintenance status", () => {
  const tools = extractTools();

  it("documents the modern ASM toolchain", () => {
    const names = tools.map((t) => t.name.toLowerCase());
    for (const expected of [
      "nuclei",
      "httpx",
      "katana",
      "naabu",
      "dnsx",
      "tlsx",
      "ffuf",
      "trufflehog",
      "gitleaks",
      "bbot",
      "cloudlist",
    ]) {
      expect(names.some((n) => n.includes(expected))).toBe(true);
    }
  });

  it("assigns every tool a maintenance status", () => {
    for (const tool of tools) {
      expect(["active", "legacy", "unknown"]).toContain(tool.status);
    }
    // Nothing should be left unclassified now that every doc carries **Status:**
    expect(tools.filter((t) => t.status === "unknown")).toHaveLength(0);
  });

  it("flags legacy tools with an explanatory note", () => {
    const legacy = tools.filter((t) => t.status === "legacy");
    expect(legacy.map((t) => t.name)).toEqual(
      expect.arrayContaining(["Recon-ng", "Fierce"])
    );
    for (const tool of legacy) {
      expect(tool.statusNote && tool.statusNote.length).toBeGreaterThan(0);
    }
  });

  it("gives every tool a purpose, link, and usage examples", () => {
    for (const tool of tools) {
      expect(tool.purpose.length).toBeGreaterThan(0);
      expect(tool.link.length).toBeGreaterThan(0);
      // Previously Fierce extracted zero examples because of a hardcoded
      // allowlist of usage-header names
      expect(tool.usage.length).toBeGreaterThan(0);
    }
  });

  it("never labels a tool with its own name as its category", () => {
    for (const tool of tools) {
      expect(tool.category).not.toBe(tool.name);
    }
  });
});

describe("guide depth", () => {
  it("the threat-intel guide is a real guide, not an outline", () => {
    const guide = extractGuides().find((g) =>
      g.slug.includes("integrating_threat_intel")
    );
    expect(guide).toBeDefined();
    // Module 9 links to this as its primary resource; it was a 24-line stub
    expect(guide!.content.split("\n").length).toBeGreaterThan(100);
    expect(guide!.content).toContain("KEV");
  });
});
