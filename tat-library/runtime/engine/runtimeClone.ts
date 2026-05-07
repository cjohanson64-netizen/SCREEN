import type { GraphNode, GraphValue } from "../graph/graph.js";

export function cloneRuntimeNode(node: GraphNode): GraphNode {
  return {
    id: node.id,
    semanticId: node.semanticId,
    contract: cloneNodeContract(node.contract),
    value: deepClone(node.value),
    state: deepCloneRecord(node.state),
    meta: deepCloneRecord(node.meta),
  };
}

export function deepClone<T extends GraphValue>(value: T): T {
  if (value === null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (typeof value === "object") {
    const out: Record<string, GraphValue> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = deepClone(v);
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

function cloneNodeContract(
  contract: GraphNode["contract"],
): GraphNode["contract"] {
  if (!contract) {
    return undefined;
  }

  return {
    ...(contract.in ? { in: [...contract.in] } : {}),
    ...(contract.out ? { out: [...contract.out] } : {}),
  };
}

export function isRecordValue(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

