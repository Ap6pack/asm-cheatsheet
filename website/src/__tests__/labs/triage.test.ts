import { describe, it, expect } from "vitest";
import { extractLabs, validateLab } from "@/lib/content/extractors";
import type { TriageLab } from "@/lib/content/types";

function triageLab(): Record<string, unknown> {
  return {
    kind: "triage",
    slug: "t",
    title: "T",
    subtitle: "s",
    category: "Triage Exercise",
    difficulty: "beginner",
    estimatedMinutes: 5,
    fictional: true,
    summary: "s",
    brief: "Read the output and decide.",
    artifacts: [
      {
        id: "httpx",
        label: "httpx",
        command: "httpx -silent",
        language: "text",
        content: "https://example.test [200]",
      },
    ],
    questions: [
      {
        id: "q1",
        prompt: "Which host matters?",
        type: "single",
        artifactIds: ["httpx"],
        options: ["A", "B"],
        correct: [1],
        explanation: "Because B.",
      },
    ],
    lessons: ["l"],
  };
}

describe("triage lab validation", () => {
  it("accepts a well-formed triage lab", () => {
    expect(() => validateLab(triageLab(), "t.json")).not.toThrow();
  });

  it("rejects an unknown kind", () => {
    const lab = { ...triageLab(), kind: "quiz" };
    expect(() => validateLab(lab, "t.json")).toThrow(/"kind"/);
  });

  it("requires artifacts and a brief", () => {
    const noArtifacts = triageLab();
    noArtifacts.artifacts = [];
    expect(() => validateLab(noArtifacts, "t.json")).toThrow(/artifacts/);

    const noBrief = triageLab();
    delete noBrief.brief;
    expect(() => validateLab(noBrief, "t.json")).toThrow(/brief/);
  });

  it("rejects a question referencing an unknown artifact", () => {
    const lab = triageLab();
    (lab.questions as Record<string, unknown>[])[0].artifactIds = ["ghost"];
    expect(() => validateLab(lab, "t.json")).toThrow(/unknown artifact/);
  });

  it("rejects an out-of-range correct index", () => {
    const lab = triageLab();
    (lab.questions as Record<string, unknown>[])[0].correct = [5];
    expect(() => validateLab(lab, "t.json")).toThrow(/out-of-range/);
  });

  it("rejects a single-answer question with several correct answers", () => {
    const lab = triageLab();
    (lab.questions as Record<string, unknown>[])[0].correct = [0, 1];
    expect(() => validateLab(lab, "t.json")).toThrow(/type "single"/);
  });

  it("rejects duplicate artifact ids", () => {
    const lab = triageLab();
    (lab.artifacts as Record<string, unknown>[]).push({
      id: "httpx",
      label: "dup",
      language: "text",
      content: "x",
    });
    expect(() => validateLab(lab, "t.json")).toThrow(/duplicate artifact/);
  });

  it("defaults a lab with no kind to incident-replay", () => {
    // Every lab authored before the triage type existed omits `kind`
    const replayShaped = {
      slug: "r",
      title: "R",
      subtitle: "s",
      category: "Incident Replay",
      difficulty: "beginner",
      estimatedMinutes: 5,
      fictional: true,
      summary: "s",
      stages: [{ id: "s1", name: "S" }],
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
      ],
      lessons: ["l"],
    };
    const lab = validateLab(replayShaped, "r.json");
    expect(lab.kind).toBe("incident-replay");
  });
});

describe("shipped triage labs", () => {
  const triage = extractLabs().filter(
    (l): l is TriageLab => l.kind === "triage"
  );

  it("ships at least two triage exercises", () => {
    expect(triage.length).toBeGreaterThanOrEqual(2);
  });

  it("every question's correct answers are in range and explained", () => {
    for (const lab of triage) {
      expect(lab.artifacts.length).toBeGreaterThan(0);
      expect(lab.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of lab.questions) {
        expect(q.correct.length).toBeGreaterThan(0);
        for (const c of q.correct) {
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(q.options.length);
        }
        expect(q.explanation.length).toBeGreaterThan(20);
        if (q.type === "single") expect(q.correct).toHaveLength(1);
      }
    }
  });

  it("questions point at evidence the learner has to read", () => {
    for (const lab of triage) {
      const artifactIds = new Set(lab.artifacts.map((a) => a.id));
      const referencing = lab.questions.filter(
        (q) => (q.artifactIds ?? []).length > 0
      );
      // The whole point is reading output, so most questions cite evidence
      expect(referencing.length).toBeGreaterThan(0);
      for (const q of referencing) {
        for (const aid of q.artifactIds!) {
          expect(artifactIds.has(aid)).toBe(true);
        }
      }
    }
  });

  it("artifacts carry realistic tool output", () => {
    for (const lab of triage) {
      for (const a of lab.artifacts) {
        expect(a.content.length).toBeGreaterThan(40);
      }
    }
  });
});
