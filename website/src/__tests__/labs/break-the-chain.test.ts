import { describe, it, expect } from "vitest";
import { computeContainment } from "@/lib/labs/break-the-chain";
import { extractLabs } from "@/lib/content/extractors";
import type { Lab } from "@/lib/content/types";

// A small linear chain A -> B -> C -> D across two stages, with controls
// cutting at B, C, and D, plus a detection-only control.
const lab: Lab = {
  slug: "t",
  title: "T",
  subtitle: "s",
  category: "Incident Replay",
  difficulty: "beginner",
  estimatedMinutes: 5,
  fictional: true,
  summary: "s",
  stages: [
    { id: "s1", name: "Stage 1" },
    { id: "s2", name: "Stage 2" },
  ],
  phases: [{ id: "recon", label: "recon", total: 10 }],
  nodes: [
    { id: "a", stageId: "s1", group: "Edge", label: "A" },
    { id: "b", stageId: "s1", group: "Launchpad", label: "B" },
    { id: "c", stageId: "s2", group: "Perimeter", label: "C" },
    { id: "d", stageId: "s2", group: "Internal", label: "D" },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
    { from: "c", to: "d" },
  ],
  events: [
    {
      id: "e1",
      t: "2026-01-01T00:00:00Z",
      phaseId: "recon",
      stageId: "s1",
      actions: 10,
      title: "x",
      blastRadius: "edge",
      ignites: ["a"],
    },
  ],
  lessons: ["l"],
  defenderBudget: 2,
  controls: [
    { id: "cut-b", label: "Cut B", detail: "d", breaksAtNode: "b" },
    { id: "cut-c", label: "Cut C", detail: "d", breaksAtNode: "c" },
    { id: "cut-d", label: "Cut D", detail: "d", breaksAtNode: "d" },
    { id: "detect", label: "Detect", detail: "d", detection: true },
  ],
};

describe("computeContainment", () => {
  it("with no controls the agent reaches the whole chain (F)", () => {
    const r = computeContainment(lab, []);
    expect(r.reachedNodeIds).toEqual(["a", "b", "c", "d"]);
    expect(r.tier).toBe("F");
    expect(r.deepestReachedNodeId).toBe("d");
  });

  it("cutting at C blocks C and D, reaching only A and B (A tier)", () => {
    const r = computeContainment(lab, ["cut-c"]);
    expect(r.reachedNodeIds).toEqual(["a", "b"]);
    expect(r.blockedNodeIds.sort()).toEqual(["c", "d"]);
    expect(r.containmentNodeId).toBe("c");
    expect(r.tier).toBe("A"); // never entered stage 2
  });

  it("cutting at the earliest node contains at the source (A+)", () => {
    const r = computeContainment(lab, ["cut-b"]);
    expect(r.reachedNodeIds).toEqual(["a"]);
    expect(r.tier).toBe("A+");
    expect(r.containmentNodeId).toBe("b");
  });

  it("cutting only at D lets the agent breach the perimeter (B tier)", () => {
    const r = computeContainment(lab, ["cut-d"]);
    expect(r.reachedNodeIds).toEqual(["a", "b", "c"]);
    // C is the first stage-2 node → perimeter breached, contained before deeper movement
    expect(r.tier).toBe("B");
    expect(r.deepestReachedNodeId).toBe("c");
  });

  it("the earliest cut dominates when multiple are deployed", () => {
    const r = computeContainment(lab, ["cut-b", "cut-d"]);
    expect(r.reachedNodeIds).toEqual(["a"]);
    expect(r.controlsUsed).toBe(2);
  });

  it("detection-only controls do not cut but are reported", () => {
    const r = computeContainment(lab, ["detect"]);
    expect(r.detection).toBe(true);
    expect(r.cutNodeIds).toEqual([]);
    expect(r.reachedNodeIds).toEqual(["a", "b", "c", "d"]);
  });
});

describe("computeContainment on the real flagship lab", () => {
  const flagship = extractLabs().find((l) =>
    l.slug.startsWith("frontier-lab-agent-intrusion")
  ) as Lab;

  it("the flagship ships a Break-the-Chain challenge", () => {
    expect(flagship.controls?.length).toBeGreaterThan(0);
    expect(flagship.defenderBudget).toBeGreaterThan(0);
  });

  it("sanitizing the dataset config contains before the internal network", () => {
    const r = computeContainment(flagship, ["sanitize-dataset-config"]);
    // hf-dataset-processor and everything downstream is blocked
    expect(r.reachedNodeIds).not.toContain("cloud-metadata");
    expect(r.reachedNodeIds).not.toContain("source-control");
    expect(["A+", "A", "B"]).toContain(r.tier);
  });

  it("isolating the eval sandbox is the highest-leverage single control", () => {
    const r = computeContainment(flagship, ["isolate-eval-egress"]);
    // package-registry cut => the launchpad and all of HF never happen
    expect(r.reachedNodeIds).not.toContain("launchpad");
    expect(r.reachedNodeIds).not.toContain("hf-dataset-processor");
    expect(r.tier).toBe("A+");
  });

  it("blocking IMDS alone still lets the perimeter fall", () => {
    const r = computeContainment(flagship, ["block-pod-imds"]);
    expect(r.reachedNodeIds).toContain("hf-dataset-processor");
    expect(r.reachedNodeIds).not.toContain("cloud-metadata");
  });

  it("deploying no controls is a full compromise", () => {
    const r = computeContainment(flagship, []);
    expect(r.tier).toBe("F");
    expect(r.reachedNodeIds).toContain("source-control");
  });
});

describe("computeContainment on the Northwind lab", () => {
  const northwind = extractLabs().find(
    (l) => l.slug === "northwind-shadow-it-breach"
  ) as Lab;

  it("ships a Break-the-Chain challenge", () => {
    expect(northwind.controls?.length).toBeGreaterThan(0);
    expect(northwind.defenderBudget).toBeGreaterThan(0);
  });

  it("CT monitoring contains the whole chain at the source", () => {
    const r = computeContainment(northwind, ["ct-monitoring"]);
    expect(r.reachedNodeIds).toEqual(["ct-logs"]);
    expect(r.tier).toBe("A+");
  });

  it("segmenting only the database still lets the network fall", () => {
    const r = computeContainment(northwind, ["segment-database"]);
    expect(r.reachedNodeIds).toContain("vpc-internal");
    expect(r.reachedNodeIds).not.toContain("db");
  });

  it("no controls ends at the customer database (full compromise)", () => {
    const r = computeContainment(northwind, []);
    expect(r.tier).toBe("F");
    expect(r.reachedNodeIds).toContain("db");
  });
});
