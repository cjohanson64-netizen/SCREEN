import type { GraphHistoryEntry, GraphNode, GraphValue } from "../graph.js";
import { getNode } from "../graph.js";
import type { NormalizedEventRecord, ProjectFieldContext } from "./projectTypes.js";
import {
  buildApplyRaw,
  cloneRecord,
  computeActionLabel,
  computeNodeLabel,
  computeNodeStatus,
  formatTraceLabel,
  historyEntryTouchesFocus,
  projectNodeReference,
  readStringField,
} from "./projectionUtils.js";
import {
  projectActionReference,
  resolveActionCandidateFromEvent,
} from "./projectionActions.js";

export function buildTimelineEvents(
  context: ProjectFieldContext,
): NormalizedEventRecord[] {
  const applyEvents = getApplyHistoryEntries(
    context.graph.history,
    context.focus,
  );

  return applyEvents.map((entry, index) =>
    normalizeApplyTimelineEvent(entry, context, index),
  );
}

export function buildTraceEvents(
  context: ProjectFieldContext,
): NormalizedEventRecord[] {
  const applyEvents = getApplyHistoryEntries(
    context.graph.history,
    context.focus,
  );

  return applyEvents.map((entry, index) =>
    normalizeApplyTraceEvent(entry, context, index),
  );
}

function getApplyHistoryEntries(
  history: GraphHistoryEntry[],
  focus: string,
): GraphHistoryEntry[] {
  return history.filter(
    (entry) => entry.op === "@apply" && historyEntryTouchesFocus(entry, focus),
  );
}

function normalizeApplyTimelineEvent(
  entry: GraphHistoryEntry,
  context: ProjectFieldContext,
  index: number,
): NormalizedEventRecord {
  const from = readStringField(entry.payload, ["from"]);
  const action = readStringField(entry.payload, ["action"]);
  const to = readStringField(entry.payload, ["to"]);
  const sourceNode =
    from && context.graph.nodes.has(from) ? getNode(context.graph, from) : null;
  const targetNode =
    to && context.graph.nodes.has(to) ? getNode(context.graph, to) : null;
  const actionCandidate = resolveActionCandidateFromEvent(
    context,
    from,
    action,
  );
  const actionNode = actionCandidate?.sourceNode ?? null;

  return {
    id: entry.id || `${context.focus}:timeline:${index}`,
    step: index + 1,
    from: from ?? undefined,
    raw: buildApplyRaw(from, action, to),
    label:
      sourceNode && action && targetNode
        ? `${computeNodeLabel(sourceNode)} targeted ${computeNodeLabel(targetNode)} with ${computeActionLabel(actionNode, action)}`
        : formatTraceLabel(entry, context, targetNode),
    event: action ?? "apply",
    action: actionCandidate ? projectActionReference(actionCandidate) : action,
    target: targetNode ? projectNodeReference(targetNode) : (to ?? undefined),
    status: targetNode ? computeNodeStatus(targetNode) : "resolved",
    state:
      targetNode && Object.keys(targetNode.state).length > 0
        ? cloneRecord(targetNode.state)
        : undefined,
    meta:
      targetNode && Object.keys(targetNode.meta).length > 0
        ? cloneRecord(targetNode.meta)
        : undefined,
  };
}

function normalizeApplyTraceEvent(
  entry: GraphHistoryEntry,
  context: ProjectFieldContext,
  index: number,
): NormalizedEventRecord {
  const from = readStringField(entry.payload, ["from"]);
  const action = readStringField(entry.payload, ["action"]);
  const to = readStringField(entry.payload, ["to"]);
  const sourceNode =
    from && context.graph.nodes.has(from) ? getNode(context.graph, from) : null;
  const targetNode =
    to && context.graph.nodes.has(to) ? getNode(context.graph, to) : null;
  const actionCandidate = resolveActionCandidateFromEvent(
    context,
    from,
    action,
  );
  const actionNode = actionCandidate?.sourceNode ?? null;

  return {
    id: entry.id || `${context.focus}:trace:${index}`,
    step: index + 1,
    from: from ?? undefined,
    to: to ?? undefined,
    raw: buildApplyRaw(from, action, to),
    label:
      sourceNode && action && targetNode
        ? `${computeNodeLabel(sourceNode)} targeted ${computeNodeLabel(targetNode)} with ${computeActionLabel(actionNode, action)}`
        : formatTraceLabel(entry, context, targetNode),
    event: "@apply",
    action: actionCandidate ? projectActionReference(actionCandidate) : action,
    target: targetNode ? projectNodeReference(targetNode) : (to ?? undefined),
    status: targetNode ? computeNodeStatus(targetNode) : "resolved",
    state:
      targetNode && Object.keys(targetNode.state).length > 0
        ? cloneRecord(targetNode.state)
        : undefined,
    meta:
      targetNode && Object.keys(targetNode.meta).length > 0
        ? cloneRecord(targetNode.meta)
        : undefined,
  };
}
