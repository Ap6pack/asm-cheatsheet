import { describe, it, expect } from "vitest";
import {
  extractQuizzes,
  extractGuides,
  extractModules,
  validateQuiz,
} from "@/lib/content/extractors";

const validQuiz = {
  moduleId: 1,
  passingScore: 70,
  questions: [
    {
      id: "q1",
      question: "What is ASM?",
      options: ["A", "B", "C"],
      correctIndex: 0,
      explanation: "Because.",
    },
  ],
};

describe("validateQuiz", () => {
  it("accepts a valid quiz", () => {
    expect(() => validateQuiz(validQuiz, "test.json")).not.toThrow();
  });

  it("rejects a missing moduleId", () => {
    const { moduleId: _, ...rest } = validQuiz;
    expect(() => validateQuiz(rest, "test.json")).toThrow(/moduleId/);
  });

  it("rejects an out-of-range passingScore", () => {
    expect(() =>
      validateQuiz({ ...validQuiz, passingScore: 0 }, "test.json")
    ).toThrow(/passingScore/);
    expect(() =>
      validateQuiz({ ...validQuiz, passingScore: 101 }, "test.json")
    ).toThrow(/passingScore/);
  });

  it("rejects an empty questions array", () => {
    expect(() =>
      validateQuiz({ ...validQuiz, questions: [] }, "test.json")
    ).toThrow(/questions/);
  });

  it("rejects duplicate question ids", () => {
    const quiz = {
      ...validQuiz,
      questions: [validQuiz.questions[0], validQuiz.questions[0]],
    };
    expect(() => validateQuiz(quiz, "test.json")).toThrow(/duplicate/);
  });

  it("rejects an out-of-range correctIndex", () => {
    const quiz = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], correctIndex: 3 }],
    };
    expect(() => validateQuiz(quiz, "test.json")).toThrow(/correctIndex/);
  });

  it("rejects fewer than 2 options", () => {
    const quiz = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], options: ["only one"] }],
    };
    expect(() => validateQuiz(quiz, "test.json")).toThrow(/options/);
  });

  it("rejects a missing explanation", () => {
    const quiz = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], explanation: "" }],
    };
    expect(() => validateQuiz(quiz, "test.json")).toThrow(/explanation/);
  });
});

describe("extractQuizzes", () => {
  it("loads a quiz for every learning module", () => {
    const quizzes = extractQuizzes();
    const modules = extractModules();
    const quizModuleIds = new Set(quizzes.map((q) => q.moduleId));

    expect(quizzes.length).toBeGreaterThan(0);
    for (const mod of modules) {
      expect(quizModuleIds.has(mod.id)).toBe(true);
    }
  });

  it("every quiz has valid questions with explanations", () => {
    for (const quiz of extractQuizzes()) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of quiz.questions) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.explanation.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("extractGuides", () => {
  it("extracts guides with titles and content", () => {
    const guides = extractGuides();
    expect(guides.length).toBeGreaterThan(0);
    for (const guide of guides) {
      expect(guide.slug.length).toBeGreaterThan(0);
      expect(guide.title.length).toBeGreaterThan(0);
      expect(guide.content.length).toBeGreaterThan(0);
    }
  });
});
