"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock,
  Play,
} from "lucide-react";
import { useProgressStore, useHydration } from "@/lib/stores";
import { cn } from "@/lib/utils/cn";

interface Step {
  number: number;
  title: string;
  timeEstimate: string;
  codeBlocks: { language: string; code: string }[];
}

interface SteppedRunnerProps {
  id: string;
  title: string;
  steps: Step[];
  mode: "workflow" | "scenario";
}

export function SteppedRunner({ id, title, steps, mode }: SteppedRunnerProps) {
  const hydrated = useHydration();
  const store = useProgressStore();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [started, setStarted] = React.useState(mode === "workflow");

  const isScenario = mode === "scenario";
  const stepLabel = isScenario ? "Phase" : "Step";

  // Restore progress from store
  React.useEffect(() => {
    if (!hydrated) return;
    if (isScenario) {
      const progress = store.scenarioProgress[id];
      if (progress) {
        setStarted(true);
        setCurrentStep(progress.currentPhase);
      }
    } else {
      store.startWorkflow(id);
      const progress = store.workflowProgress[id];
      if (progress) {
        setCurrentStep(progress.currentStep);
      }
    }
  }, [hydrated, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const completedSteps = React.useMemo(() => {
    if (!hydrated) return [] as number[];
    if (isScenario) {
      return store.scenarioProgress[id]?.completedPhases ?? [];
    }
    return store.workflowProgress[id]?.completedSteps ?? [];
  }, [hydrated, isScenario, id, store.scenarioProgress, store.workflowProgress]);

  const totalProgress =
    steps.length > 0
      ? Math.round((completedSteps.length / steps.length) * 100)
      : 0;

  const handleStart = () => {
    store.startScenario(id);
    setStarted(true);
  };

  const goNext = () => {
    if (isScenario) {
      store.completeScenarioPhase(id, currentStep);
    } else {
      store.completeWorkflowStep(id, currentStep);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Scenario start screen
  if (!started) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background-card)] p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          {steps.length} phases to complete
        </p>
        <Button onClick={handleStart} size="lg">
          <Play className="mr-2 h-4 w-4" />
          Start Scenario
        </Button>
      </div>
    );
  }

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <div
      className="space-y-6"
      role="region"
      aria-label={`${isScenario ? "Scenario" : "Workflow"}: ${title}`}
    >
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">
            {stepLabel} {currentStep + 1} of {steps.length}
          </span>
          <span className="font-medium">{totalProgress}% complete</span>
        </div>
        <Progress value={totalProgress} />
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {stepLabel} {currentStep + 1} of {steps.length}: {step.title}.{" "}
        {totalProgress}% complete.
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 flex-wrap" role="tablist">
        {steps.map((s, i) => {
          const isCompleted = completedSteps.includes(i);
          const isCurrent = i === currentStep;
          return (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              role="tab"
              aria-selected={isCurrent}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                isCurrent
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : isCompleted
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {isScenario ? `Phase ${s.number}` : s.number}
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Current step content */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">
            {stepLabel} {step.number}
          </Badge>
          <h2 className="text-xl font-semibold">{step.title}</h2>
          {step.timeEstimate && (
            <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
              <Clock className="h-3.5 w-3.5" />
              {step.timeEstimate}
            </span>
          )}
        </div>

        {step.codeBlocks.map((block, i) => (
          <ClientCodeBlock key={i} code={block.code} language={block.language} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={goNext}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Complete {isScenario ? "Scenario" : "Workflow"}
          </Button>
        ) : (
          <Button onClick={goNext}>
            Next {stepLabel}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </nav>
    </div>
  );
}

function ClientCodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mb-4">
      <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label={copied ? "Copied to clipboard" : "Copy code"}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
