import { describe, it, expect } from "vitest";
import {
  computeReplayState,
  getReplayBounds,
  getTotalActions,
  getPhaseTotal,
  msToFraction,
  nextEventFraction,
  prevEventFraction,
} from "@/lib/labs/replay";
import type { Lab } from "@/lib/content/types";

const lab: Lab = {
  slug: "test-lab",
  title: "Test Lab",
  subtitle: "for unit tests",
  category: "Incident Replay",
  difficulty: "beginner",
  estimatedMinutes: 5,
  fictional: true,
  summary: "test",
  stages: [{ id: "s1", name: "Stage 1" }],
  phases: [
    { id: "recon", label: "recon", total: 300 },
    { id: "exfil", label: "exfil", total: 100 },
  ],
  nodes: [
    { id: "n1", stageId: "s1", group: "G", label: "Node 1" },
    { id: "n2", stageId: "s1", group: "G", label: "Node 2" },
  ],
  edges: [{ from: "n1", to: "n2" }],
  events: [
    {
      id: "e1",
      t: "2026-01-01T00:00:00Z",
      phaseId: "recon",
      stageId: "s1",
      actions: 200,
      title: "Start",
      blastRadius: "sandbox",
      ignites: ["n1"],
    },
    {
      id: "e2",
      t: "2026-01-01T12:00:00Z",
      phaseId: "recon",
      stageId: "s1",
      actions: 100,
      title: "Middle",
      blastRadius: "sandbox",
    },
    {
      id: "e3",
      t: "2026-01-02T00:00:00Z",
      phaseId: "exfil",
      stageId: "s1",
      actions: 100,
      title: "End",
      blastRadius: "internal",
      ignites: ["n2"],
    },
  ],
  lessons: ["lesson"],
};

describe("replay helpers", () => {
  it("getTotalActions sums phase totals", () => {
    expect(getTotalActions(lab)).toBe(400);
  });

  it("getReplayBounds spans first to last event", () => {
    const b = getReplayBounds(lab);
    expect(b.startMs).toBe(Date.parse("2026-01-01T00:00:00Z"));
    expect(b.endMs).toBe(Date.parse("2026-01-02T00:00:00Z"));
  });

  it("at fraction 0 only the first event has happened", () => {
    const s = computeReplayState(lab, 0);
    expect(s.activeEventIndex).toBe(0);
    expect(s.actionsReplayed).toBe(200);
    expect(s.activePhaseId).toBe("recon");
    expect(s.blastRadius).toBe("sandbox");
    expect(s.litNodeIds).toEqual(["n1"]);
    expect(s.isComplete).toBe(false);
  });

  it("at the midpoint the second event has been reached", () => {
    // 0.5 of the 24h span = 12h = exactly event 2's timestamp
    const s = computeReplayState(lab, 0.5);
    expect(s.activeEventIndex).toBe(1);
    expect(s.actionsReplayed).toBe(300);
    expect(s.phaseCounts.recon).toBe(300);
    expect(s.phaseCounts.exfil).toBe(0);
  });

  it("at fraction 1 all actions are replayed and nodes lit", () => {
    const s = computeReplayState(lab, 1);
    expect(s.actionsReplayed).toBe(400);
    expect(s.phaseCounts.recon).toBe(300);
    expect(s.phaseCounts.exfil).toBe(100);
    expect(s.litNodeIds).toEqual(["n1", "n2"]);
    expect(s.lastIgnitedNodeId).toBe("n2");
    expect(s.blastRadius).toBe("internal");
    expect(s.isComplete).toBe(true);
  });

  it("phase counts never exceed phase totals", () => {
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      const s = computeReplayState(lab, f);
      for (const p of lab.phases) {
        expect(s.phaseCounts[p.id]).toBeLessThanOrEqual(
          getPhaseTotal(lab, p.id)
        );
      }
    }
  });

  it("clamps out-of-range fractions", () => {
    expect(computeReplayState(lab, -5).fraction).toBe(0);
    expect(computeReplayState(lab, 5).fraction).toBe(1);
  });

  it("nextEventFraction / prevEventFraction step between events", () => {
    const b = getReplayBounds(lab);
    const midFrac = msToFraction(b, Date.parse("2026-01-01T12:00:00Z"));
    expect(nextEventFraction(lab, 0)).toBeCloseTo(midFrac, 5);
    expect(nextEventFraction(lab, 0.99)).toBe(1);
    expect(prevEventFraction(lab, 1)).toBeCloseTo(midFrac, 5);
    expect(prevEventFraction(lab, 0)).toBe(0);
  });
});
