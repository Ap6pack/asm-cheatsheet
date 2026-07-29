import { describe, it, expect } from "vitest";
import { extractLabs, validateLab } from "@/lib/content/extractors";
import { getTotalActions } from "@/lib/labs/replay";

interface MutableLab {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  fictional: boolean;
  summary: string;
  source?: { label: string; url: string };
  stages: { id: string; name: string }[];
  phases: { id: string; label: string; total: number }[];
  nodes: { id: string; stageId: string; group: string; label: string }[];
  edges: { from: string; to: string; label?: string }[];
  events: {
    id: string;
    t: string;
    phaseId: string;
    stageId: string;
    actions: number;
    title: string;
    blastRadius: string;
    ignites?: string[];
  }[];
  lessons: string[];
}

function makeValidLab(): MutableLab {
  return {
    slug: "sample",
    title: "Sample",
    subtitle: "sub",
    category: "Incident Replay",
    difficulty: "beginner",
    estimatedMinutes: 5,
    fictional: true,
    summary: "s",
    stages: [{ id: "s1", name: "Stage 1" }],
    phases: [{ id: "recon", label: "recon", total: 100 }],
    nodes: [{ id: "n1", stageId: "s1", group: "G", label: "Node 1" }],
    edges: [],
    events: [
      {
        id: "e1",
        t: "2026-01-01T00:00:00Z",
        phaseId: "recon",
        stageId: "s1",
        actions: 100,
        title: "Only",
        blastRadius: "sandbox",
        ignites: ["n1"],
      },
    ],
    lessons: ["l"],
  };
}

describe("validateLab", () => {
  it("accepts a valid lab", () => {
    expect(() => validateLab(makeValidLab(), "sample.json")).not.toThrow();
  });

  it("rejects a bad difficulty", () => {
    const lab = { ...makeValidLab(), difficulty: "expert" };
    expect(() => validateLab(lab, "t.json")).toThrow(/difficulty/);
  });

  it("requires a source when not fictional", () => {
    const lab = { ...makeValidLab(), fictional: false };
    expect(() => validateLab(lab, "t.json")).toThrow(/source/);
  });

  it("rejects an event referencing an unknown phase", () => {
    const lab = makeValidLab();
    lab.events[0].phaseId = "ghost";
    expect(() => validateLab(lab, "t.json")).toThrow(/unknown phaseId/);
  });

  it("rejects igniting an unknown node", () => {
    const lab = makeValidLab();
    lab.events[0].ignites = ["nope"];
    expect(() => validateLab(lab, "t.json")).toThrow(/ignites unknown node/);
  });

  it("rejects an edge referencing an unknown node", () => {
    const lab = makeValidLab();
    lab.edges = [{ from: "n1", to: "ghost" }];
    expect(() => validateLab(lab, "t.json")).toThrow(/unknown node/);
  });

  it("rejects out-of-order timestamps", () => {
    const lab = makeValidLab();
    lab.phases[0].total = 200;
    lab.events.push({
      id: "e2",
      t: "2025-12-31T00:00:00Z", // earlier than e1
      phaseId: "recon",
      stageId: "s1",
      actions: 100,
      title: "Back in time",
      blastRadius: "sandbox",
    });
    expect(() => validateLab(lab, "t.json")).toThrow(/ascending order/);
  });

  it("rejects when event actions do not sum to the phase total", () => {
    const lab = makeValidLab();
    lab.phases[0].total = 999; // events only sum to 100
    expect(() => validateLab(lab, "t.json")).toThrow(/events sum to/);
  });

  it("enforces the filename/slug match", () => {
    expect(() => validateLab(makeValidLab(), "other.json", "other")).toThrow(
      /filename/
    );
  });
});

describe("extractLabs (real content)", () => {
  const labs = extractLabs();

  it("loads the shipped labs", () => {
    expect(labs.length).toBeGreaterThanOrEqual(2);
  });

  it("every lab's event actions sum to its phase totals", () => {
    for (const lab of labs) {
      const perPhase: Record<string, number> = {};
      for (const e of lab.events) {
        perPhase[e.phaseId] = (perPhase[e.phaseId] ?? 0) + (e.actions ?? 0);
      }
      for (const p of lab.phases) {
        if (p.total !== undefined) expect(perPhase[p.id] ?? 0).toBe(p.total);
      }
    }
  });

  it("the flagship incident totals ~17,600 actions", () => {
    const flagship = labs.find((l) =>
      l.slug.startsWith("frontier-lab-agent-intrusion")
    );
    expect(flagship).toBeDefined();
    expect(getTotalActions(flagship!)).toBe(17613);
    expect(flagship!.fictional).toBe(false);
    expect(flagship!.source?.url).toContain("huggingface.co");
  });

  it("every real (non-fictional) lab cites a source", () => {
    for (const lab of labs) {
      if (!lab.fictional) {
        expect(lab.source?.url).toBeTruthy();
      }
    }
  });
});
