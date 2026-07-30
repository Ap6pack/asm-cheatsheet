"use client";

import * as React from "react";
import { Eye, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Lab, IncidentReplayLab } from "@/lib/content/types";
import { LabReplay } from "@/components/labs/lab-replay";
import { BreakTheChain } from "@/components/labs/break-the-chain";
import { TriageRunner } from "@/components/labs/triage-runner";

/**
 * Routes a lab to its interaction model.
 *
 * Triage labs are a single exercise. Incident replays offer "Defend" (the
 * Break-the-Chain challenge) and "Watch" (the passive replay); replays with no
 * controls layer fall back to watch-only.
 */
export function LabExperience({ lab }: { lab: Lab }) {
  if (lab.kind === "triage") return <TriageRunner lab={lab} />;
  return <IncidentReplayExperience lab={lab} />;
}

function IncidentReplayExperience({ lab }: { lab: IncidentReplayLab }) {
  const hasChallenge = (lab.controls?.length ?? 0) > 0;
  const [mode, setMode] = React.useState<"defend" | "watch">(
    hasChallenge ? "defend" : "watch"
  );

  if (!hasChallenge) return <LabReplay lab={lab} />;

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Lab mode"
        className="inline-flex rounded-lg border border-[var(--border)] p-0.5"
      >
        <ModeTab
          active={mode === "defend"}
          onClick={() => setMode("defend")}
          icon={<Shield className="h-4 w-4" />}
          label="Defend"
        />
        <ModeTab
          active={mode === "watch"}
          onClick={() => setMode("watch")}
          icon={<Eye className="h-4 w-4" />}
          label="Watch"
        />
      </div>

      {mode === "defend" ? (
        <BreakTheChain lab={lab} />
      ) : (
        <LabReplay lab={lab} />
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
