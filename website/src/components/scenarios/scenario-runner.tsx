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
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
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
    <div className="space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">
            Phase {currentPhase + 1} of {phases.length}
          </span>
          <span className="font-medium">{totalProgress}% complete</span>
        </div>
        <Progress value={totalProgress} />
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2 flex-wrap">
        {phases.map((p, i) => {
          const isCompleted = completedPhases.includes(i);
          const isCurrent = i === currentPhase;
          return (
            <button
              key={i}
              onClick={() => setCurrentPhase(i)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                isCurrent
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : isCompleted
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
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
            <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
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
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentPhase === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentPhase === phases.length - 1 ? (
          <Button onClick={goNext}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Complete Scenario
          </Button>
        ) : (
          <Button onClick={goNext}>
            Next Phase
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
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
      <pre className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
