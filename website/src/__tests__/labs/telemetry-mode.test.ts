import { describe, it, expect } from "vitest";
import { extractLabs, validateLab } from "@/lib/content/extractors";
import type { IncidentReplayLab } from "@/lib/content/types";
import {
  getTelemetryMode,
  getTotalActions,
  getUnitLabel,
  getPhaseTotal,
  computeReplayState,
} from "@/lib/labs/replay";

function eventCountedLab() {
  return {
    slug: "t",
    title: "T",
    subtitle: "s",
    category: "Incident Replay",
    difficulty: "beginner",
    estimatedMinutes: 5,
    fictional: true,
    summary: "s",
    stages: [{ id: "s1", name: "Stage 1" }],
    // no `total` on the phase, no `actions` on the events
    phases: [{ id: "recon", label: "recon" }],
    nodes: [{ id: "n1", stageId: "s1", group: "G", label: "N" }],
    edges: [],
    events: [
      {
        id: "e1",
        t: "2026-01-01T00:00:00Z",
        phaseId: "recon",
        stageId: "s1",
        title: "One",
        blastRadius: "edge",
        ignites: ["n1"],
      },
      {
        id: "e2",
        t: "2026-01-02T00:00:00Z",
        phaseId: "recon",
        stageId: "s1",
        title: "Two",
        blastRadius: "edge",
      },
    ],
    lessons: ["l"],
  } as Record<string, unknown>;
}

describe("optional action telemetry", () => {
  it("accepts a lab with no action counts at all", () => {
    expect(() => validateLab(eventCountedLab(), "t.json")).not.toThrow();
  });

  it("rejects mixing: some phases with totals, some without", () => {
    const lab = eventCountedLab();
    (lab.phases as Record<string, unknown>[]).push({
      id: "exfil",
      label: "exfil",
      total: 10,
    });
    expect(() => validateLab(lab, "t.json")).toThrow(/every phase/);
  });

  it("rejects per-event actions when no phase declares a total", () => {
    const lab = eventCountedLab();
    (lab.events as Record<string, unknown>[])[0].actions = 5;
    expect(() => validateLab(lab, "t.json")).toThrow(/no phase declares/);
  });

  it("rejects totalActions without phase totals", () => {
    const lab = eventCountedLab();
    lab.totalActions = 100;
    expect(() => validateLab(lab, "t.json")).toThrow(/requires phase totals/);
  });

  it("counts events, not actions, in event mode", () => {
    const lab = validateLab(eventCountedLab(), "t.json") as IncidentReplayLab;
    expect(getTelemetryMode(lab)).toBe("events");
    expect(getTotalActions(lab)).toBe(2);
    expect(getPhaseTotal(lab, "recon")).toBe(2);
    expect(getUnitLabel(lab).plural).toBe("timeline steps");

    // Progress accumulates one unit per event reached
    expect(computeReplayState(lab, 0).actionsReplayed).toBe(1);
    expect(computeReplayState(lab, 1).actionsReplayed).toBe(2);
  });
});

describe("shipped labs use the mode their sources support", () => {
  const labs = extractLabs().filter(
    (l): l is IncidentReplayLab => l.kind === "incident-replay"
  );

  it("ships both action-counted and event-counted labs", () => {
    const modes = new Set(labs.map(getTelemetryMode));
    expect(modes.has("actions")).toBe(true);
    expect(modes.has("events")).toBe(true);
  });

  it("only the lab with published telemetry claims action counts", () => {
    const actionCounted = labs
      .filter((l) => getTelemetryMode(l) === "actions")
      .map((l) => l.slug);
    // The HF incident published per-phase action counts; Northwind is fictional
    // so its numbers are invented by design and labelled as such.
    expect(actionCounted).toContain("frontier-lab-agent-intrusion-2026-07");
    // Real incidents without published telemetry must not fabricate it
    for (const lab of labs) {
      if (!lab.fictional && getTelemetryMode(lab) === "actions") {
        expect(lab.source?.url).toBeTruthy();
      }
    }
  });

  it("every real incident lab cites a verifiable source and disclaims scope", () => {
    for (const lab of labs.filter((l) => !l.fictional)) {
      expect(lab.source?.url).toMatch(/^https:\/\//);
      expect(lab.disclaimer).toBeTruthy();
    }
  });

  it("the new incident labs are event-counted", () => {
    for (const slug of [
      "capital-one-ssrf-2019",
      "codecov-bash-uploader-2021",
    ]) {
      const lab = labs.find((l) => l.slug === slug);
      expect(lab, `${slug} should be published`).toBeDefined();
      expect(getTelemetryMode(lab!)).toBe("events");
      expect(lab!.controls?.length).toBeGreaterThan(0);
    }
  });
});
