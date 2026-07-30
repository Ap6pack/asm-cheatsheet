"use client";

import * as React from "react";
import {
  Shield,
  ShieldCheck,
  Play,
  RotateCcw,
  Radar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useProgressStore, useHydration } from "@/lib/stores";
import type { IncidentReplayLab } from "@/lib/content/types";
import { AttackChain, type NodeState } from "@/components/labs/attack-chain";
import {
  computeContainment,
  type ContainmentResult,
  type ContainmentTier,
} from "@/lib/labs/break-the-chain";

const TIER_STYLES: Record<
  ContainmentTier,
  { ring: string; text: string; bg: string }
> = {
  "A+": {
    ring: "border-green-500",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  A: {
    ring: "border-green-500",
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  B: {
    ring: "border-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  C: {
    ring: "border-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
  F: {
    ring: "border-red-500",
    text: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

type Phase = "select" | "running" | "result";

export function BreakTheChain({ lab }: { lab: IncidentReplayLab }) {
  const hydrated = useHydration();
  const reducedMotion = usePrefersReducedMotion();
  const markLabComplete = useProgressStore((s) => s.markLabComplete);

  const controls = lab.controls ?? [];
  const budget = lab.defenderBudget ?? controls.length;

  const [deployed, setDeployed] = React.useState<string[]>([]);
  const [phase, setPhase] = React.useState<Phase>("select");
  const [result, setResult] = React.useState<ContainmentResult | null>(null);
  const [revealCount, setRevealCount] = React.useState(0);

  const toggle = (id: string) => {
    if (phase !== "select") return;
    setDeployed((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < budget
          ? [...prev, id]
          : prev
    );
  };

  const run = () => {
    const r = computeContainment(lab, deployed);
    setResult(r);
    setRevealCount(0);
    setPhase("running");
  };

  const reset = () => {
    setPhase("select");
    setResult(null);
    setRevealCount(0);
  };

  // Sequentially reveal the reached nodes, then settle on the result.
  React.useEffect(() => {
    if (phase !== "running" || !result) return;
    if (reducedMotion) {
      setRevealCount(result.reachedNodeIds.length);
      setPhase("result");
      return;
    }
    if (revealCount >= result.reachedNodeIds.length) {
      const t = setTimeout(() => setPhase("result"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealCount((c) => c + 1), 450);
    return () => clearTimeout(t);
  }, [phase, revealCount, reducedMotion, result]);

  // Credit the lab once the defender genuinely contains the intrusion.
  React.useEffect(() => {
    if (
      phase === "result" &&
      result &&
      hydrated &&
      (result.tier === "A+" || result.tier === "A")
    ) {
      markLabComplete(lab.slug);
    }
  }, [phase, result, hydrated, lab.slug, markLabComplete]);

  const states = React.useMemo(() => {
    const map: Record<string, NodeState> = {};
    if (!result) return map;
    const revealed = new Set(result.reachedNodeIds.slice(0, revealCount));
    const fullyRevealed = revealCount >= result.reachedNodeIds.length;
    for (const node of lab.nodes) {
      if (revealed.has(node.id)) map[node.id] = "lit";
      else if (fullyRevealed && node.id === result.containmentNodeId)
        map[node.id] = "contained";
      else map[node.id] = "dark";
    }
    return map;
  }, [result, revealCount, lab.nodes]);

  const activeNodeId =
    result && revealCount > 0
      ? result.reachedNodeIds[
          Math.min(revealCount, result.reachedNodeIds.length) - 1
        ]
      : null;

  return (
    <div className="space-y-6">
      {/* Framing */}
      <div className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
          <div>
            <h3 className="font-semibold">Break the Chain</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              You&apos;re the defender. Deploy up to{" "}
              <strong>{budget}</strong> controls, then run the intrusion. Each
              control you place severs the attack chain at one point — the agent
              reaches everything up to it, and nothing beyond. Contain it as
              early as you can.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Controls panel */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Defensive controls</span>
            <span
              className={cn(
                "font-mono text-xs",
                deployed.length >= budget
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              {deployed.length}/{budget} deployed
            </span>
          </div>
          <ul className="space-y-2">
            {controls.map((control) => {
              const on = deployed.includes(control.id);
              const atCapacity = deployed.length >= budget && !on;
              const disabled = phase !== "select" || atCapacity;
              return (
                <li key={control.id}>
                  <button
                    onClick={() => toggle(control.id)}
                    disabled={disabled}
                    aria-pressed={on}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                      on
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)]",
                      !disabled && !on && "hover:border-[var(--primary)]",
                      disabled && !on && "opacity-50"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        on
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--muted-foreground)]"
                      )}
                    >
                      {on && <ShieldCheck className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        {control.label}
                        {control.detection && (
                          <Radar className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {control.detail}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center gap-2">
            {phase === "select" ? (
              <button
                onClick={run}
                disabled={deployed.length === 0}
                className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Run intrusion
              </button>
            ) : (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--primary)]"
              >
                <RotateCcw className="h-4 w-4" />
                Try a different set
              </button>
            )}
            {phase === "running" && (
              <span className="text-sm text-[var(--muted-foreground)]">
                Running…
              </span>
            )}
          </div>
        </div>

        {/* Chain */}
        <AttackChain
          lab={lab}
          states={states}
          activeNodeId={activeNodeId}
          reducedMotion={reducedMotion}
          containmentNodeId={
            phase === "result" ? result?.containmentNodeId : null
          }
          title="The attack chain"
          caption={
            phase === "select"
              ? "Deploy controls, then run to see how far the agent gets."
              : undefined
          }
        />
      </div>

      {/* Result */}
      {phase === "result" && result && (
        <ResultCard lab={lab} result={result} budget={budget} />
      )}
    </div>
  );
}

function ResultCard({
  lab,
  result,
  budget,
}: {
  lab: IncidentReplayLab;
  result: ContainmentResult;
  budget: number;
}) {
  const style = TIER_STYLES[result.tier];
  const win = result.tier === "A+" || result.tier === "A";
  return (
    <div className={cn("rounded-xl border p-4", style.ring, style.bg)}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border-2 font-mono text-lg font-bold",
            style.ring,
            style.text
          )}
        >
          {result.tier}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={cn("flex items-center gap-2 font-semibold", style.text)}>
            {win ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            {result.headline}
          </h3>
          <p className="text-sm text-[var(--foreground)]">{result.detail}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--muted-foreground)]">
        <span>
          Controls used:{" "}
          <span className="font-mono text-[var(--foreground)]">
            {result.controlsUsed}/{budget}
          </span>
        </span>
        <span>
          Nodes reached by the agent:{" "}
          <span className="font-mono text-[var(--foreground)]">
            {result.reachedNodeIds.length}/{lab.nodes.length}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Radar className="h-3.5 w-3.5" />
          {result.detection
            ? "Detected during the campaign"
            : "No behavioral detection deployed"}
        </span>
      </div>

      {!win && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Tip: the earlier in the chain you can sever it, the more you contain.
          Try to stop the agent before it reaches your internal network.
        </p>
      )}
    </div>
  );
}
