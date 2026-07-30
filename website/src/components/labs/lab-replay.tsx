"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  CheckCircle,
  ShieldAlert,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useProgressStore, useHydration } from "@/lib/stores";
import type { IncidentReplayLab } from "@/lib/content/types";
import { AttackChain, type NodeState } from "@/components/labs/attack-chain";
import {
  computeReplayState,
  getReplayBounds,
  getTotalActions,
  eventFractions,
  getPhaseTotal,
  getUnitLabel,
  msToFraction,
  nextEventFraction,
  prevEventFraction,
} from "@/lib/labs/replay";

// Time (seconds) to play the entire timeline at 1x speed.
const BASE_DURATION_SEC = 48;
const SPEEDS = [0.5, 1, 2, 4] as const;

// Per-phase accent colors, assigned by phase order (wraps for >9 phases).
const PHASE_COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#fbbf24", // amber
  "#f472b6", // pink
  "#a78bfa", // violet
  "#60a5fa", // blue
  "#34d399", // green
  "#22d3ee", // cyan
  "#c084fc", // purple
];

function phaseColor(index: number): string {
  return PHASE_COLORS[index % PHASE_COLORS.length];
}

function formatUtc(ms: number): string {
  // 2026-07-10T12:24:00.000Z -> "2026-07-10 12:24"
  const iso = new Date(ms).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

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

export function LabReplay({ lab }: { lab: IncidentReplayLab }) {
  const hydrated = useHydration();
  const markLabComplete = useProgressStore((s) => s.markLabComplete);
  const reducedMotion = usePrefersReducedMotion();

  const [fraction, setFraction] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState<number>(1);
  const completedRef = React.useRef(false);

  const bounds = React.useMemo(() => getReplayBounds(lab), [lab]);
  const totalActions = React.useMemo(() => getTotalActions(lab), [lab]);
  const units = React.useMemo(() => getUnitLabel(lab), [lab]);
  const state = React.useMemo(
    () => computeReplayState(lab, fraction),
    [lab, fraction]
  );

  const phaseIndex = React.useMemo(() => {
    const map: Record<string, number> = {};
    lab.phases.forEach((p, i) => (map[p.id] = i));
    return map;
  }, [lab.phases]);

  // Continuous playback (disabled under reduced-motion, which uses stepping).
  React.useEffect(() => {
    if (!playing || reducedMotion) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setFraction((f) => Math.min(1, f + (dt * speed) / BASE_DURATION_SEC));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, reducedMotion]);

  // Stop and record completion when the playhead reaches the end.
  React.useEffect(() => {
    if (fraction >= 1) {
      setPlaying(false);
      if (!completedRef.current && hydrated) {
        completedRef.current = true;
        markLabComplete(lab.slug);
      }
    }
  }, [fraction, hydrated, lab.slug, markLabComplete]);

  const handlePlayPause = () => {
    if (fraction >= 1) {
      completedRef.current = true; // already recorded; replaying shouldn't re-fire
      setFraction(0);
    }
    setPlaying((p) => !p);
  };
  const handleRestart = () => {
    setPlaying(false);
    setFraction(0);
  };
  const goNext = () => {
    setPlaying(false);
    setFraction(nextEventFraction(lab, fraction));
  };
  const goPrev = () => {
    setPlaying(false);
    setFraction(prevEventFraction(lab, fraction));
  };
  const skipToEnd = () => {
    setPlaying(false);
    setFraction(1);
  };

  const activeEvent =
    state.activeEventIndex >= 0 ? lab.events[state.activeEventIndex] : null;
  const activePhase = state.activePhaseId
    ? lab.phases.find((p) => p.id === state.activePhaseId)
    : null;

  const watchStates = React.useMemo(() => {
    const map: Record<string, NodeState> = {};
    for (const id of state.litNodeIds) map[id] = "lit";
    return map;
  }, [state.litNodeIds]);

  const ticks = React.useMemo(() => eventFractions(lab), [lab]);
  const dayTicks = React.useMemo(() => {
    const out: { frac: number; label: string }[] = [];
    const first = new Date(bounds.startMs);
    first.setUTCHours(0, 0, 0, 0);
    for (let d = first.getTime(); d <= bounds.endMs; d += 86_400_000) {
      if (d < bounds.startMs) continue;
      out.push({
        frac: msToFraction(bounds, d),
        label: new Date(d).toISOString().slice(8, 10),
      });
    }
    return out;
  }, [bounds]);

  return (
    <div className="space-y-6">
      {/* Header meta chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <MetaChip>
          {formatUtc(bounds.startMs).slice(0, 10)} →{" "}
          {formatUtc(bounds.endMs).slice(0, 10)} UTC
        </MetaChip>
        <MetaChip>
          {formatNumber(totalActions)} {units.plural}
        </MetaChip>
        {lab.clusters != null && (
          <MetaChip>~{formatNumber(lab.clusters)} clusters</MetaChip>
        )}
        <MetaChip>
          {lab.phases.length} phases · {lab.stages.length} stages
        </MetaChip>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {!reducedMotion && (
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
                aria-label={playing ? "Pause replay" : "Play replay"}
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {playing ? "Pause" : fraction >= 1 ? "Replay" : "Play"}
              </button>
            )}
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--primary)]"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={goPrev}
                className="rounded-md border border-[var(--border)] p-1.5 transition-colors hover:border-[var(--primary)]"
                aria-label="Previous event"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goNext}
                className="rounded-md border border-[var(--border)] p-1.5 transition-colors hover:border-[var(--primary)]"
                aria-label="Next event"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {reducedMotion && (
                <button
                  onClick={skipToEnd}
                  className="ml-1 flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--primary)]"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip to end
                </button>
              )}
            </div>

            {!reducedMotion && (
              <div className="flex items-center gap-1 rounded-md border border-[var(--border)] p-0.5">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium transition-colors",
                      speed === s
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    )}
                    aria-pressed={speed === s}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-right font-mono">
            <div className="text-lg font-semibold tabular-nums">
              {formatUtc(state.playheadMs)}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">UTC</div>
          </div>
        </div>

        {/* Scrubber */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={1000}
              step={1}
              value={Math.round(fraction * 1000)}
              onChange={(e) => {
                setPlaying(false);
                setFraction(Number(e.target.value) / 1000);
              }}
              aria-label="Timeline scrubber"
              className="w-full accent-[var(--primary)]"
            />
            {/* Event tick marks */}
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-1 -translate-y-1/2">
              {ticks.map((f, i) => (
                <span
                  key={i}
                  className="absolute h-2 w-px -translate-x-1/2 bg-[var(--muted-foreground)]/40"
                  style={{ left: `${f * 100}%` }}
                />
              ))}
            </div>
          </div>
          {/* Day axis */}
          <div className="relative mt-1 h-4 text-[10px] text-[var(--muted-foreground)]">
            {dayTicks.map((t, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 tabular-nums"
                style={{ left: `${t.frac * 100}%` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label={`${units.plural} replayed`}>
          <div className="font-mono text-3xl font-bold tabular-nums text-[var(--primary)]">
            {formatNumber(state.actionsReplayed)}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            of {formatNumber(totalActions)} total
          </p>
        </StatTile>
        <StatTile label="Active phase" icon={<Radio className="h-4 w-4" />}>
          <div className="font-mono text-2xl font-bold lowercase">
            {activePhase?.label ?? "—"}
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--muted-foreground)]">
            {activePhase?.note ?? "not started"}
          </p>
        </StatTile>
        <StatTile
          label="Blast radius"
          icon={<ShieldAlert className="h-4 w-4" />}
        >
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {state.blastRadius ?? "—"}
          </div>
        </StatTile>
      </div>

      {/* Attack chain + phase activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AttackChain
          lab={lab}
          states={watchStates}
          activeNodeId={state.lastIgnitedNodeId}
          reducedMotion={reducedMotion}
          caption="Nodes ignite as the agent reaches them."
        />
        <PhaseActivity
          lab={lab}
          phaseCounts={state.phaseCounts}
          activePhaseId={state.activePhaseId}
          phaseIndex={phaseIndex}
        />
      </div>

      {/* Current event / command panel */}
      <div
        className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4"
        aria-live="polite"
      >
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: activePhase
                ? phaseColor(phaseIndex[activePhase.id])
                : "var(--muted-foreground)",
            }}
          />
          {activeEvent ? `Now: ${activePhase?.label}` : "Press play to begin"}
        </div>
        {activeEvent ? (
          <>
            <h3 className="text-lg font-semibold">{activeEvent.title}</h3>
            {activeEvent.detail && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {activeEvent.detail}
              </p>
            )}
            {activeEvent.commands && activeEvent.commands.length > 0 && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 font-mono text-xs leading-relaxed">
                {activeEvent.commands.map((c, i) => (
                  <div key={i}>
                    <span className="select-none text-[var(--primary)]">$ </span>
                    {c}
                  </div>
                ))}
              </pre>
            )}
          </>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            Thousands of small decisions at machine speed. Watch the trust
            boundaries fall one by one.
          </p>
        )}
      </div>

      {/* Completion banner */}
      {state.isComplete && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500 bg-green-50 p-4 text-sm dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
          <span>
            Replay complete — you followed{" "}
            {formatNumber(state.actionsReplayed)} {units.plural} across{" "}
            {lab.stages.length} stages
            {totalActions > state.actionsReplayed
              ? ` (of ~${formatNumber(totalActions)} recovered)`
              : ""}
            . Review the defensive lessons below.
          </span>
        </div>
      )}
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 font-mono text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function StatTile({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function PhaseActivity({
  lab,
  phaseCounts,
  activePhaseId,
  phaseIndex,
}: {
  lab: IncidentReplayLab;
  phaseCounts: Record<string, number>;
  activePhaseId: string | null;
  phaseIndex: Record<string, number>;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
          Phase activity
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
          {getUnitLabel(lab).singular}s so far
        </span>
      </div>
      <ul className="space-y-2.5">
        {lab.phases.map((phase) => {
          const count = phaseCounts[phase.id] ?? 0;
          const total = getPhaseTotal(lab, phase.id);
          const pct = total > 0 ? (count / total) * 100 : 0;
          const color = phaseColor(phaseIndex[phase.id]);
          const isActive = activePhaseId === phase.id;
          return (
            <li key={phase.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    "font-mono text-sm lowercase",
                    isActive ? "font-semibold" : "text-[var(--foreground)]"
                  )}
                  style={isActive ? { color } : undefined}
                >
                  {phase.label}
                  {phase.note && (
                    <span className="ml-2 font-sans text-[11px] font-normal text-[var(--muted-foreground)]">
                      {phase.note}
                    </span>
                  )}
                </span>
                <span className="font-mono text-sm tabular-nums text-[var(--muted-foreground)]">
                  {formatNumber(count)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
