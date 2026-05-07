import type { SeedBlockNode, SeedEdgeEntryNode } from "../../../ast/nodeTypes.js";
import { createActionRegistry } from "../../engine/actionRegistry.js";
import { addBranch, addNode, createGraph, type Graph } from "../../graph/graph.js";
import { evaluateValueExpr, type RuntimeBindings } from "../../query/evaluateNodeCapture.js";
import { cloneRuntimeNode, isRecordValue } from "../../engine/runtimeClone.js";

export function buildSeedGraph(seed: SeedBlockNode, bindings: RuntimeBindings): Graph {
  const stateValue = evaluateValueExpr(
    seed.state,
    bindings,
    createActionRegistry(),
  );
  const metaValue = evaluateValueExpr(
    seed.meta,
    bindings,
    createActionRegistry(),
  );

  if (!isRecordValue(stateValue)) {
    throw new Error(`@seed state must resolve to an object`);
  }

  if (!isRecordValue(metaValue)) {
    throw new Error(`@seed meta must resolve to an object`);
  }

  const graph = createGraph(seed.root.name, stateValue, metaValue);

  for (const nodeRef of seed.nodes) {
    const node = bindings.nodes.get(nodeRef.ref.name);

    if (!node) {
      throw new Error(
        `Seed references unknown node binding "${nodeRef.ref.name}"`,
      );
    }

    addNode(graph, cloneRuntimeNode(node));
  }

  for (const edge of seed.edges) {
    const entry = materializeSeedEdgeEntry(edge);
    const before = graph.edges.length;
    addBranch(graph, entry.subject, entry.relation, entry.object);

    if (entry.id && graph.edges.length > before) {
      graph.edges[graph.edges.length - 1].id = entry.id;
    }
  }

  return graph;
}

function materializeSeedEdgeEntry(entry: SeedEdgeEntryNode): {
  id: string | null;
  subject: string;
  relation: string;
  object: string;
} {
  if (entry.type === "SeedEdgeBinding") {
    return {
      id: entry.name.name,
      subject: entry.edge.left.name,
      relation: entry.edge.relation.value,
      object: entry.edge.right.name,
    };
  }

  return {
    id: null,
    subject: entry.left.name,
    relation: entry.relation.value,
    object: entry.right.name,
  };
}

