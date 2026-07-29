import type { Lab, LabEvent } from "@/lib/content/types";

export interface ReplayBounds {
  startMs: number;
  endMs: number;
}

export interface ReplayState {
  fraction: number; // 0..1 position of the playhead in incident time
  playheadMs: number;
  actionsReplayed: number;
  totalActions: number;
  activeEventIndex: number; // -1 before the first event
  activePhaseId: string | null;
  activeStageId: string | null;
  blastRadius: string | null;
  phaseCounts: Record<string, number>; // cumulative actions per phase so far
  litNodeIds: string[];
  lastIgnitedNodeId: string | null;
  isComplete: boolean;
}

/**
 * How a lab measures progress.
 *
 * "actions" — the incident's responders published per-phase action counts, so
 *   the replay can show attacker actions replayed out of a real total.
 * "events"  — no such telemetry exists publicly, so the replay counts its own
 *   timeline steps instead of inventing action numbers.
 */
export type TelemetryMode = "actions" | "events";

export function getTelemetryMode(lab: Lab): TelemetryMode {
  return lab.phases.some((p) => typeof p.total === "number")
    ? "actions"
    : "events";
}

/** Units the counters are expressed in, for UI labelling. */
export function getUnitLabel(lab: Lab): { singular: string; plural: string } {
  return getTelemetryMode(lab) === "actions"
    ? { singular: "action", plural: "attacker actions" }
    : { singular: "step", plural: "timeline steps" };
}

/** What one event contributes to the counters under the lab's mode. */
function eventWeight(lab: Lab, event: LabEvent): number {
  return getTelemetryMode(lab) === "actions" ? (event.actions ?? 0) : 1;
}

/** Final total for a phase under the lab's mode. */
export function getPhaseTotal(lab: Lab, phaseId: string): number {
  if (getTelemetryMode(lab) === "actions") {
    return lab.phases.find((p) => p.id === phaseId)?.total ?? 0;
  }
  return lab.events.filter((e) => e.phaseId === phaseId).length;
}

/**
 * The grand total shown as the denominator. Uses the lab's explicit
 * totalActions when set (some recovered actions may be unclassified), else
 * the sum of phase totals — or, in events mode, the number of events.
 */
export function getTotalActions(lab: Lab): number {
  if (getTelemetryMode(lab) === "events") return lab.events.length;
  if (typeof lab.totalActions === "number") return lab.totalActions;
  return lab.phases.reduce((sum, p) => sum + (p.total ?? 0), 0);
}

/** Incident-time bounds derived from the first and last event timestamps. */
export function getReplayBounds(lab: Lab): ReplayBounds {
  const times = lab.events.map((e) => Date.parse(e.t));
  return {
    startMs: Math.min(...times),
    endMs: Math.max(...times),
  };
}

export function fractionToMs(bounds: ReplayBounds, fraction: number): number {
  const clamped = Math.min(1, Math.max(0, fraction));
  return bounds.startMs + clamped * (bounds.endMs - bounds.startMs);
}

export function msToFraction(bounds: ReplayBounds, ms: number): number {
  const span = bounds.endMs - bounds.startMs;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (ms - bounds.startMs) / span));
}

/**
 * Derive everything the UI shows from a single playhead fraction. An event
 * "has happened" once the playhead reaches its timestamp; counters, the active
 * phase, and lit nodes are all accumulated from the events that have passed.
 */
export function computeReplayState(lab: Lab, fraction: number): ReplayState {
  const bounds = getReplayBounds(lab);
  const clamped = Math.min(1, Math.max(0, fraction));
  const playheadMs = fractionToMs(bounds, clamped);
  const totalActions = getTotalActions(lab);

  const phaseCounts: Record<string, number> = {};
  for (const p of lab.phases) phaseCounts[p.id] = 0;

  const litNodeIds: string[] = [];
  let actionsReplayed = 0;
  let activeEventIndex = -1;
  let lastIgnitedNodeId: string | null = null;

  lab.events.forEach((event: LabEvent, index) => {
    if (Date.parse(event.t) > playheadMs) return;
    activeEventIndex = index;
    const weight = eventWeight(lab, event);
    actionsReplayed += weight;
    phaseCounts[event.phaseId] = (phaseCounts[event.phaseId] ?? 0) + weight;
    for (const nodeId of event.ignites ?? []) {
      if (!litNodeIds.includes(nodeId)) litNodeIds.push(nodeId);
      lastIgnitedNodeId = nodeId;
    }
  });

  const activeEvent =
    activeEventIndex >= 0 ? lab.events[activeEventIndex] : null;

  return {
    fraction: clamped,
    playheadMs,
    actionsReplayed,
    totalActions,
    activeEventIndex,
    activePhaseId: activeEvent?.phaseId ?? null,
    activeStageId: activeEvent?.stageId ?? null,
    blastRadius: activeEvent?.blastRadius ?? null,
    phaseCounts,
    litNodeIds,
    lastIgnitedNodeId,
    isComplete: clamped >= 1,
  };
}

/** The fraction at which a given event sits on the timeline (for tick marks). */
export function eventFractions(lab: Lab): number[] {
  const bounds = getReplayBounds(lab);
  return lab.events.map((e) => msToFraction(bounds, Date.parse(e.t)));
}

/** Fraction of the next event after `fraction`, or 1 if none remain. */
export function nextEventFraction(lab: Lab, fraction: number): number {
  const fractions = eventFractions(lab);
  for (const f of fractions) {
    if (f > fraction + 1e-6) return f;
  }
  return 1;
}

/** Fraction of the previous event before `fraction`, or 0 if none. */
export function prevEventFraction(lab: Lab, fraction: number): number {
  const fractions = eventFractions(lab);
  let prev = 0;
  for (const f of fractions) {
    if (f < fraction - 1e-6) prev = f;
    else break;
  }
  return prev;
}
