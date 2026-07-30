"use client";

import * as React from "react";
import { CheckCircle, ShieldCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { IncidentReplayLab } from "@/lib/content/types";

export type NodeState = "dark" | "lit" | "contained";

interface AttackChainProps {
  lab: IncidentReplayLab;
  /** Visual state per node id; missing ids default to "dark". */
  states: Record<string, NodeState>;
  /** Node to emphasize (pulse in watch mode, or the containment point). */
  activeNodeId?: string | null;
  reducedMotion?: boolean;
  /** Where the chain was severed, labelled with a "CONTAINED" marker. */
  containmentNodeId?: string | null;
  title?: string;
  caption?: string;
}

/**
 * The attack chain across trust boundaries, grouped by owner. Nodes render
 * lit (reached), contained (defended), or dark (unreached), connected by a
 * spine with the incoming edge label between them.
 */
export function AttackChain({
  lab,
  states,
  activeNodeId,
  reducedMotion,
  containmentNodeId,
  title = "Attack chain across trust boundaries",
  caption,
}: AttackChainProps) {
  const incomingLabel = React.useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const e of lab.edges) map[e.to] = e.label;
    return map;
  }, [lab.edges]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
        {title}
      </div>
      {caption && (
        <p className="mb-3 text-xs text-[var(--muted-foreground)]">{caption}</p>
      )}
      <ol className={caption ? "space-y-1" : "mt-2 space-y-1"}>
        {lab.nodes.map((node, i) => {
          const state = states[node.id] ?? "dark";
          const active = activeNodeId === node.id;
          const isContainment = containmentNodeId === node.id;
          const prevGroup = i > 0 ? lab.nodes[i - 1].group : null;
          const showGroup = node.group !== prevGroup;
          const label = incomingLabel[node.id];
          return (
            <li key={node.id}>
              {showGroup && (
                <div className="mt-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] first:mt-0">
                  {node.group}
                </div>
              )}
              {i > 0 && label && (
                <div className="ml-3 flex items-center gap-1 py-0.5 text-[10px] text-[var(--muted-foreground)]">
                  <span
                    className={
                      state === "dark"
                        ? "text-[var(--muted-foreground)]"
                        : "text-[var(--primary)]"
                    }
                  >
                    ↓
                  </span>
                  {label}
                </div>
              )}
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                  state === "lit" &&
                    "border-[var(--primary)]/60 bg-[var(--primary)]/5",
                  state === "contained" &&
                    "border-green-500/60 bg-green-50 dark:bg-green-900/20",
                  state === "dark" && "border-[var(--border)] opacity-50",
                  active &&
                    !reducedMotion &&
                    state === "lit" &&
                    "ring-2 ring-[var(--primary)]/40 animate-pulse"
                )}
              >
                {state === "contained" ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                ) : state === "lit" ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]/40" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {node.label}
                    </span>
                    {isContainment && (
                      <span className="shrink-0 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white dark:bg-green-500">
                        Contained
                      </span>
                    )}
                  </div>
                  {node.sub && (
                    <div className="truncate font-mono text-[11px] text-[var(--muted-foreground)]">
                      {node.sub}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
