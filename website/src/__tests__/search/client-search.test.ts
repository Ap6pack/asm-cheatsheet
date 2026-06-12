import { describe, it, expect } from "vitest";
import { createSearchIndex } from "@/lib/search/client-search";
import type { SearchEntry } from "@/lib/content/types";

const entries: SearchEntry[] = [
  {
    id: "module-1",
    title: "Module 1: ASM Fundamentals",
    type: "module",
    content:
      "Understand what ASM is and why it matters core components attack surface",
    url: "/learn/module-1",
    category: "Beginner Track",
    difficulty: "beginner",
  },
  {
    id: "tool-amass",
    title: "Amass",
    type: "tool",
    content: "Subdomain discovery using multiple sources passive enumeration",
    url: "/tools/amass",
    category: "Subdomain Discovery",
  },
  {
    id: "command-nmap-1",
    title: "nmap - Port Scanning",
    type: "command",
    content: "nmap -sV service version detection port scanning",
    url: "/commands#nmap",
    category: "Port Scanning",
  },
  {
    id: "guide-asm-stack",
    title: "Building Your Own ASM Stack",
    type: "guide",
    content: "Build a lightweight extensible ASM pipeline using Shodan nmap",
    url: "/guides/building_your_own_asm_stack",
  },
];

describe("createSearchIndex", () => {
  it("finds entries by exact term", () => {
    const index = createSearchIndex(entries);
    const results = index.search("amass");
    expect(results.map((r) => r.id)).toContain("tool-amass");
  });

  it("supports prefix matching for partially typed terms", () => {
    const index = createSearchIndex(entries);
    const results = index.search("subdom");
    expect(results.map((r) => r.id)).toContain("tool-amass");
  });

  it("ranks title matches above content-only matches", () => {
    const index = createSearchIndex(entries);
    const results = index.search("nmap");
    // "nmap" is in the command's title but only in the guide's content
    const ids = results.map((r) => r.id);
    expect(ids.indexOf("command-nmap-1")).toBeLessThan(
      ids.indexOf("guide-asm-stack")
    );
  });

  it("returns empty results for queries shorter than 2 characters", () => {
    const index = createSearchIndex(entries);
    expect(index.search("a")).toEqual([]);
    expect(index.search(" ")).toEqual([]);
    expect(index.search("")).toEqual([]);
  });

  it("returns empty results when nothing matches", () => {
    const index = createSearchIndex(entries);
    expect(index.search("zzzznonexistent")).toEqual([]);
  });

  it("matches category fields", () => {
    const index = createSearchIndex(entries);
    const results = index.search("port scanning");
    expect(results.map((r) => r.id)).toContain("command-nmap-1");
  });
});
