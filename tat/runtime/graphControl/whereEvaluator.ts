import type { BooleanExprNode } from "../../ast/nodeTypes.js";
import type { RuntimeBindings } from "../evaluateNodeCapture.js";
import type { Graph } from "../graph.js";
import { cloneGraphValue } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import { evaluateGraphControlValue } from "./controlValue.js";
import { evaluateGraphControlExpr } from "./controlEvaluator.js";

export function evaluatePathWhereExpr(
  graph: Graph,
  nodeId: string,
  where: BooleanExprNode,
  options?: GraphControlOptions,
): boolean {
  const node = graph.nodes.get(nodeId);
  if (!node) {
    return false;
  }

  const bindings: RuntimeBindings = {
    values: new Map(options?.bindings?.values ?? []),
    nodes: new Map(options?.bindings?.nodes ?? []),
  };
  bindings.nodes.set("node", node);
  bindings.values.set("node", {
    id: node.id,
    value: node.value,
    state: node.state,
    meta: node.meta,
  });

  switch (where.type) {
    case "BinaryBooleanExpr":
    case "UnaryBooleanExpr":
    case "GroupedBooleanExpr":
    case "ComparisonExpr":
      return evaluateGraphControlExpr(graph, where, {
        scope: options?.scope,
        bindings,
        actions: options?.actions,
      });
    default: {
      const result = evaluateGraphControlValue(graph, where, {
        scope: options?.scope,
        bindings,
        actions: options?.actions,
      });
      if (result === null) {
        return false;
      }
      if (typeof result !== "boolean") {
        throw new Error("@derive.path where must evaluate to a boolean");
      }
      return result;
    }
  }
}

export function evaluateEdgeWhereExpr(
  graph: Graph,
  edge: Graph["edges"][number],
  where: BooleanExprNode,
  options?: GraphControlOptions,
): boolean {
  const bindings: RuntimeBindings = {
    values: new Map(options?.bindings?.values ?? []),
    nodes: new Map(options?.bindings?.nodes ?? []),
  };
  bindings.values.set("edge", {
    id: edge.id,
    from: edge.subject,
    to: edge.object,
    relation: edge.relation,
    kind: edge.kind,
    meta: cloneGraphValue(edge.meta),
    context: edge.context === null ? null : cloneGraphValue(edge.context),
  });

  const result = evaluateGraphControlExpr(graph, where, {
    scope: options?.scope,
    bindings,
    actions: options?.actions,
  });

  if (typeof result !== "boolean") {
    throw new Error("@derive.edgeCount where must evaluate to a boolean");
  }

  return result;
}

