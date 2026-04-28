import type {
  ArrayLiteralNode,
  DerivePathExprNode,
  StringLiteralNode,
} from "../../ast/nodeTypes.js";
import type { Graph } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import { resolveNodeRef } from "./nodeResolution.js";
import { evaluatePathWhereExpr } from "./whereEvaluator.js";

export function evaluateDerivePath(
  graph: Graph,
  expr: DerivePathExprNode,
  options?: GraphControlOptions,
): string[] {
  if (!expr.node) {
    throw new Error("@derive.path requires a node field");
  }

  if (!expr.relation) {
    throw new Error("@derive.path requires a relation field");
  }

  if (!expr.direction) {
    throw new Error("@derive.path requires a direction field");
  }

  if (!expr.depth) {
    throw new Error("@derive.path requires a depth field");
  }

  const nodeId = resolveNodeRef(expr.node.name, options?.scope, options?.bindings);
  const relations = resolvePathRelations(expr.relation);
  const direction = expr.direction.value;
  const maxDepth = expr.depth.value;

  if (!Number.isInteger(maxDepth) || maxDepth < 1) {
    throw new Error("@derive.path depth must be an integer >= 1");
  }

  if (direction !== "incoming" && direction !== "outgoing" && direction !== "both") {
    throw new Error('@derive.path direction must be "incoming", "outgoing", or "both"');
  }

  const visited = new Set<string>([nodeId]);
  const results = new Set<string>();
  let frontier = [nodeId];

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const nextFrontier: string[] = [];

    for (const currentNodeId of frontier) {
      for (const nextNodeId of collectPathNeighbors(graph, currentNodeId, relations, direction)) {
        if (visited.has(nextNodeId)) {
          continue;
        }

        visited.add(nextNodeId);
        results.add(nextNodeId);
        nextFrontier.push(nextNodeId);
      }
    }

    if (nextFrontier.length === 0) {
      break;
    }

    frontier = nextFrontier;
  }

  const nodeIds = [...results];
  if (!expr.where) {
    return nodeIds;
  }

  return nodeIds.filter((candidateId) =>
    evaluatePathWhereExpr(graph, candidateId, expr.where!, options),
  );
}

function resolvePathRelations(relation: StringLiteralNode | ArrayLiteralNode): string[] {
  if (relation.type === "StringLiteral") {
    return [relation.value];
  }

  return relation.elements.map((element) => {
    if (element.type !== "StringLiteral") {
      throw new Error("@derive.path relation arrays must contain only string literals");
    }

    return element.value;
  });
}

function collectPathNeighbors(
  graph: Graph,
  nodeId: string,
  relations: string[],
  direction: "incoming" | "outgoing" | "both",
): string[] {
  const relationSet = new Set(relations);
  const neighbors = new Set<string>();

  if (direction === "outgoing" || direction === "both") {
    for (const edge of graph.edges) {
      if (edge.subject === nodeId && relationSet.has(edge.relation)) {
        neighbors.add(edge.object);
      }
    }
  }

  if (direction === "incoming" || direction === "both") {
    for (const edge of graph.edges) {
      if (edge.object === nodeId && relationSet.has(edge.relation)) {
        neighbors.add(edge.subject);
      }
    }
  }

  return [...neighbors];
}

