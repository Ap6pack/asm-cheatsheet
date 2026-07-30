import type { IncidentReplayLab, LabControl } from "@/lib/content/types";

export type ContainmentTier = "A+" | "A" | "B" | "C" | "F";

export interface ContainmentResult {
  deployedControlIds: string[];
  controlsUsed: number;
  detection: boolean;
  /** Nodes a deployed control directly severs. */
  cutNodeIds: string[];
  /** Cut nodes plus everything downstream of them. */
  blockedNodeIds: string[];
  /** Nodes the agent still reaches, in chain order. */
  reachedNodeIds: string[];
  /** The earliest severed node that actually stopped the agent. */
  containmentNodeId: string | null;
  deepestReachedNodeId: string | null;
  tier: ContainmentTier;
  headline: string;
  detail: string;
}

function buildAdjacency(lab: IncidentReplayLab): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const node of lab.nodes) adj.set(node.id, []);
  for (const edge of lab.edges) {
    if (adj.has(edge.from)) adj.get(edge.from)!.push(edge.to);
  }
  return adj;
}

/** Nodes with no incoming edge — where the agent starts. */
function rootNodeIds(lab: IncidentReplayLab): string[] {
  const hasIncoming = new Set(lab.edges.map((e) => e.to));
  const roots = lab.nodes
    .filter((n) => !hasIncoming.has(n.id))
    .map((n) => n.id);
  return roots.length > 0 ? roots : lab.nodes.slice(0, 1).map((n) => n.id);
}

/** Every node reachable from `start` following edges, inclusive. */
function downstreamOf(
  adj: Map<string, string[]>,
  start: string
): Set<string> {
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const n = stack.pop()!;
    if (seen.has(n)) continue;
    seen.add(n);
    for (const next of adj.get(n) ?? []) stack.push(next);
  }
  return seen;
}

export function getControlById(
  lab: IncidentReplayLab,
  id: string
): LabControl | undefined {
  return lab.controls?.find((c) => c.id === id);
}

/**
 * Given the set of deployed controls, work out how far the agent gets.
 * A control's `breaksAtNode` severs that node and everything downstream; the
 * agent then reaches only the nodes still connected to a root.
 */
export function computeContainment(
  lab: IncidentReplayLab,
  deployedControlIds: string[]
): ContainmentResult {
  const controls = lab.controls ?? [];
  const deployed = controls.filter((c) =>
    deployedControlIds.includes(c.id)
  );
  const adj = buildAdjacency(lab);

  const cutNodeIds = deployed
    .map((c) => c.breaksAtNode)
    .filter((id): id is string => !!id && lab.nodes.some((n) => n.id === id));
  const detection = deployed.some((c) => c.detection === true);

  const blocked = new Set<string>();
  for (const cut of cutNodeIds) {
    for (const d of downstreamOf(adj, cut)) blocked.add(d);
  }

  // Reachable from any root, refusing to enter blocked nodes.
  const reached = new Set<string>();
  const queue = rootNodeIds(lab).filter((r) => !blocked.has(r));
  while (queue.length) {
    const n = queue.shift()!;
    if (reached.has(n)) continue;
    reached.add(n);
    for (const next of adj.get(n) ?? []) {
      if (!blocked.has(next)) queue.push(next);
    }
  }

  const reachedNodeIds = lab.nodes
    .filter((n) => reached.has(n.id))
    .map((n) => n.id);

  // Where the agent was stopped: the earliest blocked node whose predecessor
  // (or root position) was actually reached.
  let containmentNodeId: string | null = null;
  for (const node of lab.nodes) {
    if (!blocked.has(node.id)) continue;
    const preds = lab.edges
      .filter((e) => e.to === node.id)
      .map((e) => e.from);
    const stoppedHere =
      preds.some((p) => reached.has(p)) ||
      (preds.length === 0 && reachedNodeIds.length === 0);
    if (stoppedHere) {
      containmentNodeId = node.id;
      break;
    }
  }

  const deepestReachedNodeId =
    reachedNodeIds.length > 0
      ? reachedNodeIds[reachedNodeIds.length - 1]
      : null;

  const { tier, headline, detail } = gradeContainment(lab, reachedNodeIds);

  return {
    deployedControlIds: deployed.map((c) => c.id),
    controlsUsed: deployed.length,
    detection,
    cutNodeIds,
    blockedNodeIds: [...blocked],
    reachedNodeIds,
    containmentNodeId,
    deepestReachedNodeId,
    tier,
    headline,
    detail,
  };
}

function gradeContainment(
  lab: IncidentReplayLab,
  reachedNodeIds: string[]
): { tier: ContainmentTier; headline: string; detail: string } {
  const nodeById = new Map(lab.nodes.map((n) => [n.id, n]));
  const stage1Id = lab.stages[0]?.id;
  const lastNode = lab.nodes[lab.nodes.length - 1];
  const firstStage2Node = lab.nodes.find((n) => n.stageId !== stage1Id);
  const reachedSet = new Set(reachedNodeIds);
  const deepest =
    reachedNodeIds.length > 0
      ? nodeById.get(reachedNodeIds[reachedNodeIds.length - 1])!
      : null;
  const anyStage2 = reachedNodeIds.some(
    (id) => nodeById.get(id)!.stageId !== stage1Id
  );

  if (lastNode && reachedSet.has(lastNode.id)) {
    return {
      tier: "F",
      headline: "Full compromise",
      detail: `The agent reached ${lastNode.label} — the chain ran to completion.`,
    };
  }

  if (anyStage2 && deepest) {
    if (firstStage2Node && deepest.id === firstStage2Node.id) {
      return {
        tier: "B",
        headline: "Perimeter breached",
        detail: `Contained at ${deepest.group}, before any lateral movement.`,
      };
    }
    return {
      tier: "C",
      headline: "Internal network breached",
      detail: `Contained inside ${deepest.group}, before the final objective.`,
    };
  }

  if (reachedNodeIds.length <= 1 || !deepest) {
    return {
      tier: "A+",
      headline: "Contained at the source",
      detail: "The agent never left its starting environment.",
    };
  }

  const nextStageName = lab.stages[1]?.name;
  return {
    tier: "A",
    headline: "Contained in Stage 1",
    detail: nextStageName
      ? `${nextStageName} was never reached — the agent got only as far as ${deepest.group}.`
      : `The agent got only as far as ${deepest.group}.`,
  };
}
