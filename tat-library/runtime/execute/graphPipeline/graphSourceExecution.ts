import type { ComposeExprNode, GraphPipelineNode } from "../../../ast/nodeTypes.js";
import { addNode, cloneGraph, createGraph, type Graph } from "../../graph/graph.js";
import { buildSeedGraph } from "../seed/seedGraph.js";
import type { RuntimeState } from "../../engine/runtimeState.js";
import { cloneRuntimeNode, deepCloneRecord } from "../../engine/runtimeClone.js";

export function materializeGraphSource(
  source: GraphPipelineNode["source"],
  state: RuntimeState,
): Graph {
  if (source.type === "SeedSource") {
    if (source.seed) {
      return buildSeedGraph(source.seed, state.bindings);
    }

    if (!state.seedGraph) {
      throw new Error(
        `Cannot execute graph pipeline from @seed before @seed is defined`,
      );
    }
    return cloneGraph(state.seedGraph);
  }

  if (source.type === "GraphRef") {
    const graphName = source.graphId.name;
    const graph = state.graphs.get(graphName);
    if (!graph) {
      throw new Error(`Graph source "${graphName}" is not a graph value`);
    }
    return cloneGraph(graph);
  }

  return executeComposeSource(source, state);
}

function executeComposeSource(
  compose: ComposeExprNode,
  state: RuntimeState,
): Graph {
  const mergeSymbol = compose.merge.name;
  const mergeNodeId = resolveMergeNodeId(mergeSymbol, state);
  const out = createGraph(mergeNodeId);

  for (const asset of compose.assets) {
    const assetName = asset.name;
    const kind = state.assetKinds.get(assetName);
    if (!kind) {
      throw new Error(`@compose input "${assetName}" is unresolved`);
    }
    if (kind !== "graph" && kind !== "fragment") {
      throw new Error(
        `Invalid @compose input kind for "${assetName}": expected graph or fragment, got ${kind}`,
      );
    }

    const sourceGraph = state.graphs.get(assetName);
    if (!sourceGraph) {
      throw new Error(`@compose input "${assetName}" is not a graph value`);
    }

    const sourceMergeNode = sourceGraph.nodes.get(mergeNodeId);
    if (!sourceMergeNode) {
      throw new Error(
        `Missing merge anchor "${mergeNodeId}" in composed asset "${assetName}"`,
      );
    }

    if (!out.nodes.has(mergeNodeId)) {
      addNode(out, cloneRuntimeNode(sourceMergeNode));
    }

    for (const [nodeId, node] of sourceGraph.nodes.entries()) {
      if (nodeId === mergeNodeId) {
        continue;
      }
      if (out.nodes.has(nodeId)) {
        throw new Error(
          `Duplicate non-merge node id "${nodeId}" during @compose`,
        );
      }
      addNode(out, cloneRuntimeNode(node));
    }

    for (const edge of sourceGraph.edges) {
      out.edges.push({ ...edge });
    }

    for (const entry of sourceGraph.history) {
      out.history.push({
        id: entry.id,
        op: entry.op,
        payload: deepCloneRecord(entry.payload),
      });
    }
  }

  out.root = mergeNodeId;
  return out;
}

function resolveMergeNodeId(mergeSymbol: string, state: RuntimeState): string {
  if (state.bindings.nodes.has(mergeSymbol)) {
    return state.bindings.nodes.get(mergeSymbol)!.id;
  }

  if (state.bindings.values.has(mergeSymbol)) {
    const resolved = state.bindings.values.get(mergeSymbol);
    if (typeof resolved === "string") {
      return resolved;
    }
  }

  throw new Error(
    `Invalid merge symbol "${mergeSymbol}": expected an in-scope node symbol`,
  );
}

