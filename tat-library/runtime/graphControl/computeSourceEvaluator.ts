import type {
  AggregateQueryExprNode,
  ComputeSourceNode,
  StringLiteralNode,
} from "../../ast/nodeTypes.js";
import type { Graph, GraphNode, GraphValue } from "../graph/graph.js";
import type { GraphControlOptions } from "./types.js";
import { evaluateDerivePath } from "./pathTraversal.js";
import { isRecord } from "./utils.js";

export function evaluateComputeSource(
  graph: Graph,
  source: ComputeSourceNode,
  options?: GraphControlOptions,
): string[] {
  if (source.type === "DerivePathExpr") {
    return evaluateDerivePath(graph, source, options);
  }

  if (source.type === "Identifier") {
    return resolveComputeCollection(source.name, options);
  }

  return evaluateComputeQuery(graph, source);
}

export function resolveComputeCollection(
  name: string,
  options?: GraphControlOptions,
): string[] {
  const bindingValue = options?.bindings?.values.get(name);
  if (!Array.isArray(bindingValue)) {
    throw new Error(`Compute source "${name}" must resolve to an array`);
  }

  return bindingValue.flatMap((entry) => {
    if (typeof entry === "string") {
      return [entry];
    }

    if (isRecord(entry) && typeof entry.id === "string") {
      return [entry.id];
    }

    return [];
  });
}

export function collectComputeFieldValues(
  graph: Graph,
  source: ComputeSourceNode | null,
  field: StringLiteralNode | null,
  options?: GraphControlOptions,
  opName = "@compute.sum",
): number[] {
  if (!source) {
    throw new Error(`${opName} requires a from field`);
  }

  if (!field) {
    throw new Error(`${opName} requires a field field`);
  }

  const ids = evaluateComputeSource(graph, source, options);
  const values: number[] = [];

  for (const nodeId of ids) {
    const node = graph.nodes.get(nodeId);
    if (!node) {
      continue;
    }

    const raw = resolveComputeFieldValue(node, field.value);
    if (typeof raw === "number" && Number.isFinite(raw)) {
      values.push(raw);
    }
  }

  return values;
}

function evaluateComputeQuery(
  graph: Graph,
  query: AggregateQueryExprNode,
): string[] {
  if (!query.typeName) {
    throw new Error('@query(...) compute source requires a "type" field');
  }

  const ids: string[] = [];
  for (const node of graph.nodes.values()) {
    if (isRecord(node.value) && node.value.type === query.typeName.value) {
      ids.push(node.id);
    }
  }
  return ids;
}

function resolveComputeFieldValue(
  node: GraphNode,
  field: string,
): GraphValue | null {
  if (Object.prototype.hasOwnProperty.call(node.state, field)) {
    return node.state[field];
  }

  if (Object.prototype.hasOwnProperty.call(node.meta, field)) {
    return node.meta[field];
  }

  if (isRecord(node.value) && Object.prototype.hasOwnProperty.call(node.value, field)) {
    return node.value[field];
  }

  return null;
}

