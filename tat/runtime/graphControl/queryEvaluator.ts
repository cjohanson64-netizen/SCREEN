import type { GraphQueryExprNode } from "../../ast/nodeTypes.js";
import type { Graph } from "../graph.js";
import { getNode, hasEdge } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import { evaluateGraphValue, resolveNodeRef } from "./nodeResolution.js";
import { graphValueEquals } from "./utils.js";

export function evaluateGraphQuery(
  graph: Graph,
  query: GraphQueryExprNode,
  options?: GraphControlOptions,
): boolean {
  const scope = options?.scope;
  const bindings = options?.bindings;
  const actions = options?.actions;

  const usesEdgeMode =
    query.subject !== null || query.relation !== null || query.object !== null;
  const usesStateMode = query.state !== null;
  const usesMetaMode = query.meta !== null;
  const modeCount = Number(usesEdgeMode) + Number(usesStateMode) + Number(usesMetaMode);

  if (modeCount !== 1) {
    throw new Error(
      "@query must use exactly one mode: edge existence, state query, or meta query",
    );
  }

  if (usesEdgeMode) {
    if (!query.subject || !query.relation || !query.object) {
      throw new Error("@query edge existence requires subject, relation, and object");
    }

    if (query.equals) {
      throw new Error('@query edge existence does not support an "equals" field');
    }

    const subject = resolveNodeRef(query.subject.name, scope, bindings);
    const object = resolveNodeRef(query.object.name, scope, bindings);
    return hasEdge(graph, subject, query.relation.value, object);
  }

  if (!query.node) {
    throw new Error("@query state/meta mode requires a node field");
  }

  const nodeId = resolveNodeRef(query.node.name, scope, bindings);
  const node = getNode(graph, nodeId);

  if (query.state) {
    if (query.meta) {
      throw new Error('@query cannot combine "state" and "meta" fields');
    }

    const hasKey = Object.prototype.hasOwnProperty.call(node.state, query.state.value);
    if (!hasKey) {
      return false;
    }

    if (!query.equals) {
      return true;
    }

    const expected = evaluateGraphValue(query.equals, bindings, actions);
    return graphValueEquals(node.state[query.state.value], expected);
  }

  if (query.meta) {
    const hasKey = Object.prototype.hasOwnProperty.call(node.meta, query.meta.value);
    if (!hasKey) {
      return false;
    }

    if (!query.equals) {
      return true;
    }

    const expected = evaluateGraphValue(query.equals, bindings, actions);
    return graphValueEquals(node.meta[query.meta.value], expected);
  }

  throw new Error('@query state/meta mode requires either a "state" or "meta" field');
}

