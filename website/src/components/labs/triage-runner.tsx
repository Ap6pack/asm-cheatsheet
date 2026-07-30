"use client";

import * as React from "react";
import {
  Terminal,
  CheckCircle,
  XCircle,
  Search,
  RotateCcw,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useProgressStore, useHydration } from "@/lib/stores";
import type { TriageLab } from "@/lib/content/types";

const DEFAULT_PASSING_SCORE = 70;

/**
 * Given real tool output, decide what matters.
 *
 * Evidence stays on screen while the questions are answered — the point of the
 * exercise is reading the output, not remembering it.
 */
export function TriageRunner({ lab }: { lab: TriageLab }) {
  const hydrated = useHydration();
  const markLabComplete = useProgressStore((s) => s.markLabComplete);

  const [activeArtifact, setActiveArtifact] = React.useState(
    lab.artifacts[0]?.id ?? ""
  );
  const [answers, setAnswers] = React.useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const passingScore = lab.passingScore ?? DEFAULT_PASSING_SCORE;
  const total = lab.questions.length;

  const isCorrect = React.useCallback(
    (questionId: string) => {
      const q = lab.questions.find((x) => x.id === questionId);
      if (!q) return false;
      const given = [...(answers[questionId] ?? [])].sort();
      const want = [...q.correct].sort();
      return (
        given.length === want.length && given.every((v, i) => v === want[i])
      );
    },
    [lab.questions, answers]
  );

  const score = React.useMemo(
    () => lab.questions.filter((q) => isCorrect(q.id)).length,
    [lab.questions, isCorrect]
  );
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= passingScore;

  const answeredCount = lab.questions.filter(
    (q) => (answers[q.id] ?? []).length > 0
  ).length;

  const toggleAnswer = (questionId: string, index: number) => {
    if (submitted) return;
    const q = lab.questions.find((x) => x.id === questionId);
    if (!q) return;
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (q.type === "single") return { ...prev, [questionId]: [index] };
      return {
        ...prev,
        [questionId]: current.includes(index)
          ? current.filter((i) => i !== index)
          : [...current, index],
      };
    });
  };

  React.useEffect(() => {
    if (submitted && passed && hydrated) markLabComplete(lab.slug);
  }, [submitted, passed, hydrated, lab.slug, markLabComplete]);

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const artifact =
    lab.artifacts.find((a) => a.id === activeArtifact) ?? lab.artifacts[0];

  return (
    <div className="space-y-6">
      {/* Brief */}
      <div className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/5 p-4">
        <div className="flex items-start gap-3">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
          <div>
            <h3 className="font-semibold">Your brief</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {lab.brief}
            </p>
          </div>
        </div>
      </div>

      {/* Evidence */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)]">
        <div
          role="tablist"
          aria-label="Evidence"
          className="flex flex-wrap gap-1 border-b border-[var(--border)] p-2"
        >
          {lab.artifacts.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={a.id === artifact?.id}
              onClick={() => setActiveArtifact(a.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                a.id === artifact?.id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
              {a.label}
            </button>
          ))}
        </div>
        {artifact && (
          <div>
            {artifact.command && (
              <div className="border-b border-[var(--border)] px-4 py-2 font-mono text-xs text-[var(--muted-foreground)]">
                <span className="select-none text-[var(--primary)]">$ </span>
                {artifact.command}
              </div>
            )}
            <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed">
              {artifact.content}
            </pre>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Award className="h-5 w-5" />
          Triage decisions
          <span className="ml-auto text-xs font-normal text-[var(--muted-foreground)]">
            {total} questions · {passingScore}% to pass
          </span>
        </h3>

        <div className="space-y-8">
          {lab.questions.map((q, qi) => {
            const given = answers[q.id] ?? [];
            const correct = submitted && isCorrect(q.id);
            const wrong = submitted && !correct;
            return (
              <fieldset key={q.id}>
                <legend className="mb-1 font-medium">
                  <span className="text-[var(--muted-foreground)]">
                    {qi + 1}.
                  </span>{" "}
                  {q.prompt}
                </legend>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                  {q.type === "multi"
                    ? "Select all that apply."
                    : "Select one."}
                  {q.artifactIds && q.artifactIds.length > 0 && (
                    <>
                      {" · Evidence: "}
                      {q.artifactIds.map((aid, i) => {
                        const a = lab.artifacts.find((x) => x.id === aid);
                        if (!a) return null;
                        return (
                          <React.Fragment key={aid}>
                            {i > 0 && ", "}
                            <button
                              onClick={() => setActiveArtifact(aid)}
                              className="underline hover:text-[var(--primary)]"
                            >
                              {a.label}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </>
                  )}
                </p>

                <div
                  className="space-y-2"
                  role={q.type === "single" ? "radiogroup" : "group"}
                  aria-label={q.prompt}
                >
                  {q.options.map((option, oi) => {
                    const selected = given.includes(oi);
                    const shouldBe = q.correct.includes(oi);
                    const showCorrect = submitted && shouldBe;
                    const showWrong = submitted && selected && !shouldBe;
                    return (
                      <button
                        key={oi}
                        type="button"
                        role={q.type === "single" ? "radio" : "checkbox"}
                        aria-checked={selected}
                        disabled={submitted}
                        onClick={() => toggleAnswer(q.id, oi)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          !submitted &&
                            (selected
                              ? "border-[var(--primary)] bg-[var(--background-elevated)]"
                              : "border-[var(--border)] hover:border-[var(--primary)]"),
                          showCorrect &&
                            "border-green-500 bg-green-50 dark:bg-green-900/20",
                          showWrong &&
                            "border-red-500 bg-red-50 dark:bg-red-900/20",
                          submitted &&
                            !showCorrect &&
                            !showWrong &&
                            "border-[var(--border)] opacity-60"
                        )}
                      >
                        {showCorrect && (
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        )}
                        {showWrong && (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                        )}
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <p
                    className={cn(
                      "mt-2 rounded-md px-3 py-2 text-sm",
                      correct
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    )}
                  >
                    {wrong && <strong>Not quite. </strong>}
                    {q.explanation}
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>

        {!submitted ? (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {answeredCount}/{total} answered
            </p>
            <button
              onClick={() => setSubmitted(true)}
              disabled={answeredCount < total}
              className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Submit triage
            </button>
          </div>
        ) : (
          <div
            role="status"
            className={cn(
              "mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border p-4",
              passed
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-[var(--border)] bg-[var(--muted)]"
            )}
          >
            <p className="font-medium">
              {passed
                ? `Triage complete — ${score}/${total} (${percentage}%). You read the output correctly.`
                : `You scored ${score}/${total} (${percentage}%). You need ${passingScore}% — review the explanations and the evidence, then try again.`}
            </p>
            <button
              onClick={retry}
              className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--primary)]"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
