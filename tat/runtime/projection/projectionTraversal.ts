import type { Graph, GraphEdge, GraphNode, GraphValue } from "../graph.js";
import { getIncomingEdges, getNode, getOutgoingEdges } from "../graph.js";
import type { ProjectFieldContext } from "./projectTypes.js";
import type { ProjectIncludeKey } from "./projectFormatRules.js";
import {
  compareProjectionNodes,
  isBirthParentEdge,
  isSpouseEdge,
  isStepParentEdge,
} from "./projectionUtils.js";
import { selectNodeFields } from "./projectionSelection.js";

export function collectGenerationDepths(
  graph: Graph,
  startNodeId: string,
  direction: "incoming" | "outgoing",
  maxDepth: number,
): Map<number, string[]> {
  const visited = new Set<string>([startNodeId]);
  const depthMap = new Map<number, string[]>();
  let frontier = [startNodeId];

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const nextFrontier: string[] = [];

    for (const currentNodeId of frontier) {
      const neighbors = collectProjectedPathNeighbors(
        graph,
        currentNodeId,
        new Set(["birthParent", "parentOf"]),
        direction,
      );

      for (const nextNodeId of neighbors) {
        if (visited.has(nextNodeId)) {
          continue;
        }

        visited.add(nextNodeId);
        nextFrontier.push(nextNodeId);
      }
    }

    if (nextFrontier.length === 0) {
      break;
    }

    depthMap.set(depth, nextFrontier);
    frontier = nextFrontier;
  }

  return depthMap;
}

export function projectGenerationNodes(
  nodeIds: string[],
  include: ProjectIncludeKey[],
  context: ProjectFieldContext,
): Array<Record<string, GraphValue>> {
  return [...new Set(nodeIds)]
    .map((nodeId) => getNode(context.graph, nodeId))
    .sort(compareProjectionNodes)
    .map((node) => selectNodeFields(node, include, context));
}

export function collectProjectedPathNodeIds(
  graph: Graph,
  startNodeId: string,
  relations: string[],
  direction: "incoming" | "outgoing" | "both",
  maxDepth: number,
): string[] {
  const relationSet = new Set(relations);
  const visited = new Set<string>([startNodeId]);
  const results = new Set<string>();
  let frontier = [startNodeId];

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const nextFrontier: string[] = [];

    for (const currentNodeId of frontier) {
      for (const nextNodeId of collectProjectedPathNeighbors(
        graph,
        currentNodeId,
        relationSet,
        direction,
      )) {
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

  return [...results];
}

export function collectProjectedPathNeighbors(
  graph: Graph,
  nodeId: string,
  relations: Set<string>,
  direction: "incoming" | "outgoing" | "both",
): string[] {
  const neighbors = new Set<string>();

  if (direction === "outgoing" || direction === "both") {
    for (const edge of getOutgoingEdges(graph, nodeId, "branch")) {
      if (relations.has(edge.relation)) {
        neighbors.add(edge.object);
      }
    }
  }

  if (direction === "incoming" || direction === "both") {
    for (const edge of getIncomingEdges(graph, nodeId, "branch")) {
      if (relations.has(edge.relation)) {
        neighbors.add(edge.subject);
      }
    }
  }

  return [...neighbors];
}

export function projectRelationshipNodes(
  edges: GraphEdge[],
  side: "subject" | "object" | "other",
  include: ProjectIncludeKey[],
  context: ProjectFieldContext,
  focusId?: string,
): Array<Record<string, GraphValue>> {
  const nodeIds = new Set<string>();

  for (const edge of edges) {
    let nodeId: string;

    if (side === "subject") {
      nodeId = edge.subject;
    } else if (side === "object") {
      nodeId = edge.object;
    } else {
      nodeId = edge.subject === focusId ? edge.object : edge.subject;
    }

    if (nodeId) {
      nodeIds.add(nodeId);
    }
  }

  return [...nodeIds]
    .map((nodeId) => getNode(context.graph, nodeId))
    .sort(compareProjectionNodes)
    .map((node) => selectNodeFields(node, include, context));
}

export function getPreferredListEdges(graph: Graph, nodeId: string): GraphEdge[] {
  const relationPriority = ["targets", "contains", "unlocks", "can"];
  const outgoingEdges = getOutgoingEdges(graph, nodeId).filter(
    (edge) => edge.kind === "branch",
  );

  for (const relation of relationPriority) {
    const matches = outgoingEdges.filter((edge) => edge.relation === relation);
    if (matches.length > 0) {
      return matches;
    }
  }

  return outgoingEdges;
}

export function getPreferredTreeEdges(graph: Graph, nodeId: string): GraphEdge[] {
  const relationPriority = ["unlocks", "contains", "targets", "can"];
  const outgoingEdges = getOutgoingEdges(graph, nodeId).filter(
    (edge) => edge.kind === "branch",
  );
  const genealogyEdges = outgoingEdges.filter(
    (edge) => isBirthParentEdge(edge) || isSpouseEdge(edge),
  );

  if (genealogyEdges.length > 0) {
    const childEdges = genealogyEdges.filter((edge) => isBirthParentEdge(edge));
    const spouseEdges = genealogyEdges.filter((edge) => isSpouseEdge(edge));
    const seenTargets = new Set<string>();

    return [...childEdges, ...spouseEdges]
      .sort(compareProjectionEdges)
      .filter((edge) => {
        if (seenTargets.has(edge.object)) {
          return false;
        }

        seenTargets.add(edge.object);
        return true;
      });
  }

  for (const relation of relationPriority) {
    const matches = outgoingEdges.filter((edge) => edge.relation === relation);
    if (matches.length > 0) {
      return matches;
    }
  }

  return outgoingEdges;
}

function compareProjectionEdges(a: GraphEdge, b: GraphEdge): number {
  const relationWeight = (edge: GraphEdge) => {
    if (isBirthParentEdge(edge)) return 0;
    if (isSpouseEdge(edge)) return 1;
    return 2;
  };

  const relationDiff = relationWeight(a) - relationWeight(b);
  if (relationDiff !== 0) {
    return relationDiff;
  }

  return a.object.localeCompare(b.object);
}
