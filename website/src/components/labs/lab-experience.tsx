"use client";

import * as React from "react";
import { Eye, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Lab } from "@/lib/content/types";
import { LabReplay } from "@/components/labs/lab-replay";
import { BreakTheChain } from "@/components/labs/break-the-chain";

/**
 * A lab is experienced in one of two modes: "Defend" (the Break-the-Chain
 * challenge) or "Watch" (the passive replay). Labs without a controls layer
 * fall back to watch-only.
 */
export function LabExperience({ lab }: { lab: Lab }) {
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
