"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Clock, Play } from "lucide-react";
import { useProgressStore, useHydration } from "@/lib/stores";
import { cn } from "@/lib/utils/cn";

interface Phase {
  phaseNumber: number;
  title: string;
  timeEstimate: string;
  codeBlocks: { language: string; code: string }[];
}

interface ScenarioRunnerProps {
  scenarioId: string;
  scenarioTitle: string;
  phases: Phase[];
}

export function ScenarioRunner({ scenarioId, scenarioTitle, phases }: ScenarioRunnerProps) {
  const hydrated = useHydration();
  const { scenarioProgress, startScenario, completeScenarioPhase } = useProgressStore();
  const [currentPhase, setCurrentPhase] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (hydrated) {
      const progress = scenarioProgress[scenarioId];
      if (progress) {
        setStarted(true);
        setCurrentPhase(progress.currentPhase);
      }
    }
  }, [hydrated, scenarioId, scenarioProgress]);

  const progress = hydrated ? scenarioProgress[scenarioId] : null;
  const completedPhases = progress?.completedPhases ?? [];
  const totalProgress = phases.length > 0 ? Math.round((completedPhases.length / phases.length) * 100) : 0;

  const handleStart = () => {
    startScenario(scenarioId);
    setStarted(true);
  };

  const goNext = () => {
    completeScenarioPhase(scenarioId, currentPhase);
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const goPrev = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  // Start screen
  if (!started) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">{scenarioTitle}</h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            {phases.length} phases to complete
          </p>
          <Button onClick={handleStart} size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Scenario
          </Button>
        </CardContent>
      </Card>
    );
  }

  const phase = phases[currentPhase];
  if (!phase) return null;

  return (
    <div className="space-y-6" role="region" aria-label={`Scenario: ${scenarioTitle}`}>
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted-foreground)]">
            Phase {currentPhase + 1} of {phases.length}
          </span>
          <span className="font-medium">{totalProgress}% complete</span>
        </div>
        <Progress value={totalProgress} aria-label={`Scenario progress: ${totalProgress}% complete`} />
      </div>

      {/* Screen reader progress announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Phase {currentPhase + 1} of {phases.length}: {phase?.title}. {totalProgress}% complete.
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Scenario phases">
        {phases.map((p, i) => {
          const isCompleted = completedPhases.includes(i);
          const isCurrent = i === currentPhase;
          return (
            <button
              key={i}
              onClick={() => setCurrentPhase(i)}
              role="tab"
              aria-selected={isCurrent}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Phase ${p.phaseNumber}: ${p.title}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
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
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Circle className="h-3 w-3" aria-hidden="true" />
              )}
              Phase {p.phaseNumber}
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Current phase content */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Badge>Phase {phase.phaseNumber}</Badge>
          <h2 className="text-xl font-semibold">{phase.title}</h2>
          {phase.timeEstimate && (
            <span className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
              <Clock className="h-3.5 w-3.5" />
              {phase.timeEstimate}
            </span>
          )}
        </div>

        {phase.codeBlocks.map((block, i) => (
          <ClientCodeBlock key={i} code={block.code} language={block.language} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between pt-4" aria-label="Scenario phase navigation">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentPhase === 0}
          aria-label={currentPhase > 0 ? `Go to previous phase: Phase ${phases[currentPhase - 1]?.phaseNumber}` : "Previous phase (disabled)"}
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          Previous
        </Button>

        {currentPhase === phases.length - 1 ? (
          <Button onClick={goNext} aria-label="Mark phase as complete and finish scenario">
            <CheckCircle className="mr-1 h-4 w-4" aria-hidden="true" />
            Complete Scenario
          </Button>
        ) : (
          <Button onClick={goNext} aria-label={`Mark phase as complete and go to phase ${phases[currentPhase + 1]?.phaseNumber}`}>
            Next Phase
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </nav>
    </div>
  );
}

function ClientCodeBlock({ code, language }: { code: string; language: string }) {
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
        aria-label={copied ? "Copied to clipboard" : `Copy ${language} code to clipboard`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
