import type { GraphEdge, GraphNode, GraphValue } from "../../graph/graph.js";
import { deepClone, deepCloneRecord } from "./clone.js";
import { isRecord, stringifyGraphValue, truthy } from "./referenceKind.js";

export { isRecord, stringifyGraphValue, truthy } from "./referenceKind.js";

export function dig(value: GraphValue, path: string[]): GraphValue {
  let current: GraphValue = value;

  for (const key of path) {
    if (!isRecord(current)) return null;
    if (!(key in current)) return null;
    current = current[key];
  }

  return current;
}

export function whereNodeToValue(node: GraphNode): Record<string, GraphValue> {
  return {
    id: node.id,
    value: deepClone(node.value),
    state: deepCloneRecord(node.state),
    meta: deepCloneRecord(node.meta),
  };
}

export function whereEdgeToValue(edge: GraphEdge): Record<string, GraphValue> {
  return {
    id: edge.id,
    from: edge.subject,
    to: edge.object,
    rel: edge.relation,
    subject: edge.subject,
    object: edge.object,
    relation: edge.relation,
    kind: edge.kind,
    meta: deepCloneRecord(edge.meta),
    context: edge.context,
  };
}

export function compareStrict(a: GraphValue, b: GraphValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function compareCaseInsensitive(a: GraphValue, b: GraphValue): boolean {
  const aNorm = normalizeCaseInsensitive(a);
  const bNorm = normalizeCaseInsensitive(b);
  return JSON.stringify(aNorm) === JSON.stringify(bNorm);
}

export function compareNumeric(
  operator: "<" | "<=" | ">" | ">=",
  left: GraphValue,
  right: GraphValue,
): boolean {
  if (typeof left !== "number" || typeof right !== "number") {
    throw new Error(`Numeric comparison "${operator}" requires number operands`);
  }

  switch (operator) {
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
  }
}

export function normalizeCaseInsensitive(value: GraphValue): GraphValue {
  if (typeof value === "string") {
    return value.toLowerCase();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeCaseInsensitive(item));
  }

  if (isRecord(value)) {
    const out: Record<string, GraphValue> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = normalizeCaseInsensitive(v);
    }
    return out;
  }

  return value;
}

