import type { Graph, GraphEdge, GraphHistoryEntry, GraphNode, GraphValue } from "../graph.js";
import { cloneGraphValue, getNode } from "../graph.js";
import type { ProjectFieldContext } from "./projectTypes.js";

export function isBirthParentEdge(edge: GraphEdge): boolean {
  return (
    edge.relation === "birthParent" ||
    (edge.relation === "parentOf" &&
      (edge.meta.kind === "birth" || edge.meta.kind === undefined))
  );
}

export function isStepParentEdge(edge: GraphEdge): boolean {
  return (
    edge.relation === "stepParent" ||
    (edge.relation === "parentOf" && edge.meta.kind === "step")
  );
}

export function isSpouseEdge(edge: GraphEdge): boolean {
  return (
    edge.relation === "spouse" ||
    (edge.relation === "spouseOf" &&
      (edge.meta.active === true || edge.meta.active === undefined))
  );
}

export function resolveFocusNode(graph: Graph, focus: string): GraphNode {
  return getNode(graph, focus);
}

export function projectNodeReference(node: GraphNode): Record<string, GraphValue> {
  return {
    id: node.id,
    ...(typeof node.semanticId === "string"
      ? { semanticId: node.semanticId }
      : {}),
    ...(node.contract
      ? {
          contract: {
            ...(node.contract.in ? { in: [...node.contract.in] } : {}),
            ...(node.contract.out ? { out: [...node.contract.out] } : {}),
          },
        }
      : {}),
    label: computeNodeLabel(node),
    value: cloneGraphValue(node.value),
    state: cloneRecord(node.state),
    meta: cloneRecord(node.meta),
    status: computeNodeStatus(node),
  };
}

export function deriveProjectionStatus(node: GraphNode): string | null {
  if (typeof node.meta.status === "string") return node.meta.status;
  if (typeof node.meta.result === "string") return node.meta.result;
  if (typeof node.state.status === "string") return node.state.status;
  if (node.state.defeated === true) return "defeated";
  if (node.state.active === true) return "active";
  if (node.state.resolved === true) return "resolved";
  if (node.state.ready === true) return "ready";
  return null;
}

export function computeNodeLabel(node: GraphNode): string {
  if (isRecord(node.value) && typeof node.value.fullName === "string") {
    return node.value.fullName;
  }
  if (isRecord(node.value) && typeof node.value.name === "string") {
    return node.value.name;
  }
  if (typeof node.meta.label === "string") {
    return node.meta.label;
  }
  return node.id;
}

export function computeNodeType(node: GraphNode): string | null {
  if (isRecord(node.value) && typeof node.value.type === "string") {
    return node.value.type;
  }
  return null;
}

export function compareProjectionNodes(a: GraphNode, b: GraphNode): number {
  return Number(a.meta.order ?? 999) - Number(b.meta.order ?? 999);
}

export function computeNodeStatus(node: GraphNode): string {
  if (typeof node.state.status === "string") return node.state.status;
  if (typeof node.meta.status === "string") return node.meta.status;
  if (node.state.defeated === true) return "defeated";
  if (node.state.active === true) return "active";
  if (node.state.resolved === true) return "resolved";
  if (node.state.ready === true) return "ready";
  return "ready";
}

export function buildApplyRaw(
  from: string | undefined,
  action: string | undefined,
  to: string | undefined,
): string | undefined {
  if (!from || !action || !to) {
    return undefined;
  }

  return `@apply(<${from}.${action}.${to}>)`;
}

export function computeActionLabel(
  actionNode: GraphNode | null,
  fallback: string | undefined,
): string {
  if (actionNode) {
    return computeNodeLabel(actionNode);
  }

  return fallback ?? "Apply";
}

export function historyEntryTouchesFocus(
  entry: GraphHistoryEntry,
  focus: string,
): boolean {
  return Object.values(entry.payload).some((value) => value === focus);
}

export function readStringField(
  payload: Record<string, GraphValue>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    if (typeof payload[key] === "string") {
      return payload[key] as string;
    }
  }
  return undefined;
}

export function formatTraceLabel(
  entry: GraphHistoryEntry,
  context: ProjectFieldContext,
  targetNode: GraphNode | null,
): string {
  const subject = readStringField(entry.payload, ["subject", "from", "nodeId"]);
  const relation = readStringField(entry.payload, ["relation"]);
  const object = readStringField(entry.payload, ["object", "to"]);

  if (relation && object && targetNode) {
    const sourceLabel =
      subject && context.graph.nodes.has(subject)
        ? computeNodeLabel(getNode(context.graph, subject))
        : context.focus;
    return `${sourceLabel} ${relation} ${computeNodeLabel(targetNode)}`;
  }

  return `${entry.op} ${targetNode ? computeNodeLabel(targetNode) : context.focus}`.trim();
}

export function cloneRecord(
  record: Record<string, GraphValue>,
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = cloneGraphValue(value);
  }
  return out;
}

export function isRecord(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function exhaustiveNever(value: never): never {
  throw new Error(
    `Unsupported projection expression: ${JSON.stringify(value)}`,
  );
}

export function titleCase(value: string): string {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}
