"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgressStore, useHydration } from "@/lib/stores";
import { GraduationCap, GitBranch, Shield, CheckCircle } from "lucide-react";

interface ProgressOverviewProps {
  totalModules: number;
  totalWorkflows: number;
  totalScenarios: number;
}

export function ProgressOverview({ totalModules, totalWorkflows, totalScenarios }: ProgressOverviewProps) {
  const hydrated = useHydration();
  const { moduleStarted, workflowProgress, scenarioProgress, completedCriteria } = useProgressStore();

  if (!hydrated) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 animate-pulse rounded bg-[hsl(var(--muted))]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const modulesStarted = Object.values(moduleStarted).filter(Boolean).length;
  const modulesCompleted = Object.keys(completedCriteria).filter(key => {
    const criteria = completedCriteria[key];
    return criteria && criteria.length > 0;
  }).length;

  const workflowsStarted = Object.keys(workflowProgress).length;
  const workflowsCompleted = Object.values(workflowProgress).filter(wp => wp.completedAt).length;

  const scenariosStarted = Object.keys(scenarioProgress).length;
  const scenariosCompleted = Object.values(scenarioProgress).filter(sp => sp.completedAt).length;

  const stats = [
    {
      label: "Learning Modules",
      icon: GraduationCap,
      started: modulesStarted,
      completed: modulesCompleted,
      total: totalModules,
      color: "text-green-500",
    },
    {
      label: "Workflows",
      icon: GitBranch,
      started: workflowsStarted,
      completed: workflowsCompleted,
      total: totalWorkflows,
      color: "text-yellow-500",
    },
    {
      label: "Scenarios",
      icon: Shield,
      started: scenariosStarted,
      completed: scenariosCompleted,
      total: totalScenarios,
      color: "text-red-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const progress = stat.total > 0 ? Math.round((stat.started / stat.total) * 100) : 0;
        return (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.started}
                <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                  /{stat.total}
                </span>
              </div>
              <Progress value={progress} className="mt-2 h-1.5" />
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {stat.started === 0
                  ? "Not started"
                  : `${stat.started} started, ${stat.completed} completed`}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
