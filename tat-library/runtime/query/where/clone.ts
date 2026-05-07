import type { GraphEdge, GraphNode, GraphValue } from "../../graph/graph.js";

export function cloneNode(node: GraphNode): GraphNode {
  return {
    id: node.id,
    value: deepClone(node.value),
    state: deepCloneRecord(node.state),
    meta: deepCloneRecord(node.meta),
  };
}

export function cloneEdge(edge: GraphEdge): GraphEdge {
  return {
    ...edge,
    meta: deepCloneRecord(edge.meta),
    context: edge.context === null ? null : deepClone(edge.context),
  };
}

export function deepClone<T extends GraphValue>(value: T): T {
  if (value === null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (isRecord(value)) {
    const out: Record<string, GraphValue> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = deepClone(item);
    }
    return out as T;
  }

  return value;
}

export function deepCloneRecord<T extends Record<string, GraphValue>>(record: T): T {
  const out: Record<string, GraphValue> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = deepClone(value);
  }
  return out as T;
}

function isRecord(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
