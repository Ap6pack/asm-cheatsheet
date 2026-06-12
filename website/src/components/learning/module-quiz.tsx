"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Award, RefreshCw } from "lucide-react";
import { useProgressStore, useHydration } from "@/lib/stores";
import { QUIZ_PASS_THRESHOLD } from "@/lib/stores/progress-store";
import { cn } from "@/lib/utils/cn";
import type { Quiz } from "@/lib/content/types";

interface ModuleQuizProps {
  moduleId: string;
  quiz: Quiz;
}

export function ModuleQuiz({ moduleId, quiz }: ModuleQuizProps) {
  const hydrated = useHydration();
  const { quizResults, recordQuizAttempt } = useProgressStore();
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const result = hydrated ? quizResults[moduleId] : undefined;
  const passingScore = quiz.passingScore ?? QUIZ_PASS_THRESHOLD;
  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  const score = React.useMemo(
    () =>
      quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length,
    [quiz.questions, answers]
  );
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= passingScore;

  const selectAnswer = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    recordQuizAttempt(moduleId, score, total);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <Card>
      <CardHeader>
        {/* Real h2 instead of CardTitle's div so the quiz is a navigable section heading */}
        <h2 className="flex flex-wrap items-center gap-3 text-xl font-semibold leading-none tracking-tight">
          <Award className="h-5 w-5" />
          Knowledge Check
          {result?.passedAt && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Passed
            </Badge>
          )}
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {total} questions · {passingScore}% to pass
          {result &&
            ` · Best score: ${result.bestScore}/${result.totalQuestions} (${result.attempts} attempt${result.attempts === 1 ? "" : "s"})`}
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {quiz.questions.map((q, qIndex) => {
          const selected = answers[q.id];
          const isCorrect = submitted && selected === q.correctIndex;
          const isWrong =
            submitted && selected !== undefined && selected !== q.correctIndex;

          return (
            <fieldset key={q.id}>
              <legend className="mb-3 font-medium">
                <span className="text-[var(--muted-foreground)]">
                  {qIndex + 1}.
                </span>{" "}
                {q.question}
              </legend>
              <div className="space-y-2" role="radiogroup" aria-label={q.question}>
                {q.options.map((option, oIndex) => {
                  const isSelected = selected === oIndex;
                  const showCorrect = submitted && oIndex === q.correctIndex;
                  const showWrong =
                    submitted && isSelected && oIndex !== q.correctIndex;

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      disabled={submitted}
                      onClick={() => selectAnswer(q.id, oIndex)}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        !submitted &&
                          (isSelected
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
              {(isCorrect || isWrong) && (
                <p
                  className={cn(
                    "mt-2 rounded-md px-3 py-2 text-sm",
                    isCorrect
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  {q.explanation}
                </p>
              )}
            </fieldset>
          );
        })}

        {!submitted ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {answeredCount}/{total} answered
            </p>
            <Button onClick={handleSubmit} disabled={answeredCount < total}>
              Submit Answers
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-md border p-4",
              passed
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-[var(--border)] bg-[var(--muted)]"
            )}
            role="status"
          >
            <p className="font-medium">
              {passed ? (
                <>
                  You passed with {score}/{total} ({percentage}%). Nice work!
                </>
              ) : (
                <>
                  You scored {score}/{total} ({percentage}%). You need{" "}
                  {passingScore}% to pass — review the explanations and try
                  again.
                </>
              )}
            </p>
            <Button variant="outline" onClick={handleRetake}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Retake Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
