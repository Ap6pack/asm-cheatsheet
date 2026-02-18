"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Clock } from "lucide-react";
import { useProgressStore, useHydration } from "@/lib/stores";
import { cn } from "@/lib/utils/cn";

interface WizardStep {
  stepNumber: number;
  title: string;
  timeEstimate: string;
  codeBlocks: { language: string; code: string }[];
}

interface WorkflowWizardProps {
  workflowId: string;
  workflowTitle: string;
  steps: WizardStep[];
}

export function WorkflowWizard({ workflowId, workflowTitle, steps }: WorkflowWizardProps) {
  const hydrated = useHydration();
  const { workflowProgress, startWorkflow, completeWorkflowStep } = useProgressStore();
  const [currentStep, setCurrentStep] = React.useState(0);

  // Initialize workflow on first render
  React.useEffect(() => {
    if (hydrated) {
      startWorkflow(workflowId);
      const progress = workflowProgress[workflowId];
      if (progress) {
        setCurrentStep(progress.currentStep);
      }
    }
  }, [hydrated, workflowId]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = hydrated ? workflowProgress[workflowId] : null;
  const completedSteps = progress?.completedSteps ?? [];
  const totalProgress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

  const step = steps[currentStep];

  const goNext = () => {
    completeWorkflowStep(workflowId, currentStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  if (!step) return null;

  return (
    <div className="space-y-6" role="region" aria-label={`Workflow: ${workflowTitle}`}>
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="font-medium">{totalProgress}% complete</span>
        </div>
        <Progress value={totalProgress} aria-label={`Workflow progress: ${totalProgress}% complete`} />
      </div>

      {/* Screen reader progress announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {currentStep + 1} of {steps.length}: {step?.title}. {totalProgress}% complete.
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Workflow steps">
        {steps.map((s, i) => {
          const isCompleted = completedSteps.includes(i);
          const isCurrent = i === currentStep;
          return (
            <button
              key={i}
              onClick={() => goToStep(i)}
              role="tab"
              aria-selected={isCurrent}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Step ${s.stepNumber}: ${s.title}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
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
                <CheckCircle className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Circle className="h-3 w-3" aria-hidden="true" />
              )}
              {s.stepNumber}
            </button>
          );
        })}
      </div>

      <Separator />

      {/* Current step content */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">Step {step.stepNumber}</Badge>
          <h2 className="text-xl font-semibold">{step.title}</h2>
          {step.timeEstimate && (
            <span className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
              <Clock className="h-3.5 w-3.5" />
              {step.timeEstimate}
            </span>
          )}
        </div>

        {/* Code blocks - rendered as simple pre/code since CodeBlock is server-only */}
        {step.codeBlocks.map((block, i) => (
          <ClientCodeBlock key={i} code={block.code} language={block.language} />
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between pt-4" aria-label="Workflow step navigation">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
          aria-label={currentStep > 0 ? `Go to previous step: Step ${steps[currentStep - 1]?.stepNumber}` : "Previous step (disabled)"}
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={goNext} aria-label="Mark step as complete and finish workflow">
            <CheckCircle className="mr-1 h-4 w-4" aria-hidden="true" />
            Complete Workflow
          </Button>
        ) : (
          <Button onClick={goNext} aria-label={`Mark step as complete and go to step ${steps[currentStep + 1]?.stepNumber}`}>
            Next Step
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </nav>
    </div>
  );
}

// Simple client-side code block with copy button
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
        className="absolute right-2 top-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label={copied ? "Copied to clipboard" : `Copy ${language} code to clipboard`}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
