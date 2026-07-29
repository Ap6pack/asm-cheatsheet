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

/** Sum of every phase's final action total — the grand total for the lab. */
export function getTotalActions(lab: Lab): number {
  return lab.phases.reduce((sum, p) => sum + p.total, 0);
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
    actionsReplayed += event.actions;
    phaseCounts[event.phaseId] =
      (phaseCounts[event.phaseId] ?? 0) + event.actions;
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
