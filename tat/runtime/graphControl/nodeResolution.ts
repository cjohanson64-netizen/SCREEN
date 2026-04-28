import type { PropertyAccessNode, ValueExprNode } from "../../ast/nodeTypes.js";
import type { RuntimeBindings } from "../evaluateNodeCapture.js";
import { evaluateValueExpr } from "../evaluateNodeCapture.js";
import type { Graph, GraphValue } from "../graph.js";
import type { ActionRegistry } from "../actionRegistry.js";
import type { GraphControlOptions, GraphControlScope } from "./types.js";
import { dig, isRecord } from "./utils.js";

export function resolveNodeRef(
  name: string,
  scope?: GraphControlScope,
  bindings?: RuntimeBindings,
): string {
  if (name === "from" && scope?.from) return scope.from;
  if (name === "to" && scope?.to) return scope.to;
  if (bindings?.nodes.has(name)) return bindings.nodes.get(name)!.id;

  const boundValue = bindings?.values.get(name);
  if (typeof boundValue === "string") {
    return boundValue;
  }

  return name;
}

export function resolveGraphControlIdentifier(
  name: string,
  graph: Graph,
  options?: GraphControlOptions,
): GraphValue {
  if (name === "from" && options?.scope?.from) return options.scope.from;
  if (name === "to" && options?.scope?.to) return options.scope.to;
  if (name === "payload") return null;
  if (options?.bindings?.nodes.has(name)) return options.bindings.nodes.get(name)!.id;
  if (options?.bindings?.values.has(name)) return options.bindings.values.get(name)!;
  if (graph.nodes.has(name)) return name;
  return name;
}

export function resolveGraphControlPropertyAccess(
  access: PropertyAccessNode,
  graph: Graph,
  options?: GraphControlOptions,
): GraphValue {
  const base = resolveGraphControlIdentifier(access.object.name, graph, options);

  if (isRecord(base)) {
    return dig(base, access.chain.map((part) => part.name));
  }

  if (typeof base === "string" && graph.nodes.has(base)) {
    const node = graph.nodes.get(base)!;
    const chain = access.chain.map((part) => part.name);
    const first = chain[0];
    if (!first) return null;

    if (first === "state") return dig(node.state, chain.slice(1));
    if (first === "meta") return dig(node.meta, chain.slice(1));
    if (first === "value") return dig(node.value, chain.slice(1));
    if (first in node.state) return dig(node.state, chain);
    if (first in node.meta) return dig(node.meta, chain);
    if (isRecord(node.value) && first in node.value) return dig(node.value, chain);
  }

  return null;
}

export function evaluateGraphValue(
  value: ValueExprNode,
  bindings?: RuntimeBindings,
  actions?: ActionRegistry,
): GraphValue {
  if (!bindings || !actions) {
    if (value.type === "Identifier") {
      return value.name;
    }
  }

  return evaluateValueExpr(
    value,
    bindings ?? { values: new Map(), nodes: new Map() },
    actions ?? new Map(),
  );
}

