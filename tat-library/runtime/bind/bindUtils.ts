import type {
  ArrayLiteralNode,
  BindEntity,
  IdentifierNode,
  ObjectLiteralNode,
  ValueExprNode,
  WhereExprNode,
} from "../../ast/nodeTypes.js";
import type { ActionRegistry } from "../engine/actionRegistry.js";
import type { RuntimeBindings } from "../query/evaluateNodeCapture.js";
import {
  evaluateCapturedShape,
} from "../query/evaluateNodeCapture.js";
import type { Graph, GraphEdge, GraphNode, GraphValue } from "../graph/graph.js";
import { evaluateGraphQuery } from "../graphControl/queryEvaluator.js";
import { evaluateGraphControlExpr } from "../graphControl/controlEvaluator.js";
import { executeWhereQuery } from "../query/executeWhere.js";

export type BindValue =
  | GraphValue
  | GraphNode
  | GraphEdge
  | { [key: string]: BindValue }
  | BindValue[];

export type BindResultKind = BindEntity | "empty" | "value" | "mixed";

export function evaluateBindExpr(
  expr: ValueExprNode,
  bindings: RuntimeBindings,
  actions: ActionRegistry,
  graph: Graph | null,
): BindValue {
  const phase7Expr = expr as any;

  if (phase7Expr.type === "GraphQueryExpr") {
    if (!graph) throw new Error("@query.* requires an active graph source");
    return evaluateGraphQuery(graph, phase7Expr, { bindings, actions });
  }

  if (phase7Expr.type === "PathExpr") {
    if (!graph) throw new Error("@path.* requires an active graph source");
    return evaluatePhase7PathExpr(graph, phase7Expr, bindings);
  }

  if (phase7Expr.type === "ChooseExpr") {
    if (!graph) throw new Error("@choose requires an active graph source for condition evaluation");
    if (!phase7Expr.when) throw new Error("@choose requires a condition");
    const condition = evaluateGraphControlExpr(graph, phase7Expr.when, { bindings, actions });
    return evaluateBindExpr(condition ? phase7Expr.then : phase7Expr.else, bindings, actions, graph);
  }

  switch (expr.type) {
    case "Identifier":
      return evaluateBindIdentifier(expr, bindings, graph);

    case "StringLiteral":
      return expr.value;

    case "NumberLiteral":
      return expr.value;

    case "BooleanLiteral":
      return expr.value;

    case "PropertyAccess": {
      const base = bindings.values.get(expr.object.name);
      if (!isRecord(base)) {
        return null;
      }

      let current: GraphValue = base;
      for (const part of expr.chain) {
        if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, part.name)) {
          return null;
        }
        current = current[part.name];
      }

      return current;
    }

    case "RuntimeGenerateNodeIdExpr":
      throw new Error("@runtime.generateNodeId is only valid during runtime action execution");

    case "RuntimeGenerateValueIdExpr":
      throw new Error("@runtime.generateValueId is only valid during runtime action execution");

    case "RuntimeNextOrderExpr":
      throw new Error("@runtime.nextOrder is only valid during runtime action execution");

    case "NodeCapture":
      return evaluateCapturedShape(expr, bindings, actions);

    case "WhereExpr":
      return evaluateBindWhereExpr(expr, bindings, graph);

    case "ObjectLiteral":
      return evaluateBindObject(expr, bindings, actions, graph);

    case "ArrayLiteral":
      return evaluateBindArray(expr, bindings, actions, graph);

    case "ChooseExpr":
    case "DirectiveCallExpr":
      throw new Error(`Unsupported @bind expression "${expr.type}"`);

    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "ComputeEdgeCountExpr":
    case "ComputeExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "ComputeSumExpr":
    case "ComputeMinExpr":
    case "ComputeMaxExpr":
    case "ComputeAvgExpr":
    case "ComputeAbsExpr":
    case "DeriveBinaryExpr":
      throw new Error(`Unsupported @bind derive expression "${expr.type}"`);
    case "CurrentValue":
    case "PreviousValue":
      throw new Error(`Unsupported @bind derive expression "${expr.type}"`);

    default:
      return exhaustiveNever(expr);
  }
}

function evaluateBindWhereExpr(
  expr: WhereExprNode,
  bindings: RuntimeBindings,
  graph: Graph | null,
): BindValue {
  if (!graph) {
    throw new Error(`@where requires an active graph from @seed or a graph pipeline`);
  }

  return executeWhereQuery(graph, expr.expression, bindings).items as BindValue;
}

export function classifyBindValue(value: BindValue): BindResultKind {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "empty";
    }

    let found: BindEntity | null = null;

    for (const item of value) {
      const kind = classifyBindValue(item);

      if (kind === "empty") {
        continue;
      }

      if (kind !== "node" && kind !== "edge") {
        return "value";
      }

      if (found && found !== kind) {
        return "mixed";
      }

      found = kind;
    }

    return found ?? "empty";
  }

  if (isGraphNode(value)) {
    return "node";
  }

  if (isGraphEdge(value)) {
    return "edge";
  }

  return "value";
}

function evaluateBindIdentifier(
  node: IdentifierNode,
  bindings: RuntimeBindings,
  graph: Graph | null,
): BindValue {
  if (bindings.nodes.has(node.name)) {
    return cloneGraphNode(bindings.nodes.get(node.name)!);
  }

  if (graph) {
    const edge = graph.edges.find((item) => item.id === node.name);
    if (edge) {
      return cloneGraphEdge(edge);
    }
  }

  if (bindings.values.has(node.name)) {
    return deepClone(bindings.values.get(node.name)!);
  }

  return node.name;
}

function evaluateBindObject(
  node: ObjectLiteralNode,
  bindings: RuntimeBindings,
  actions: ActionRegistry,
  graph: Graph | null,
): Record<string, BindValue> {
  const out: Record<string, BindValue> = {};

  for (const prop of node.properties) {
    out[prop.key] = evaluateBindExpr(prop.value, bindings, actions, graph);
  }

  return out;
}

function evaluateBindArray(
  node: ArrayLiteralNode,
  bindings: RuntimeBindings,
  actions: ActionRegistry,
  graph: Graph | null,
): BindValue[] {
  return node.elements.map((element) => evaluateBindExpr(element, bindings, actions, graph));
}

function isGraphNode(value: unknown): value is GraphNode {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as GraphNode).id === "string" &&
    "value" in (value as GraphNode) &&
    isRecord((value as GraphNode).state) &&
    isRecord((value as GraphNode).meta)
  );
}

function isGraphEdge(value: unknown): value is GraphEdge {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as GraphEdge).id === "string" &&
    typeof (value as GraphEdge).subject === "string" &&
    typeof (value as GraphEdge).relation === "string" &&
    typeof (value as GraphEdge).object === "string" &&
    ((value as GraphEdge).kind === "branch" || (value as GraphEdge).kind === "progress")
  );
}

function cloneGraphNode(node: GraphNode): GraphNode {
  return {
    id: node.id,
    semanticId: node.semanticId,
    contract: node.contract
      ? {
          ...(node.contract.in ? { in: [...node.contract.in] } : {}),
          ...(node.contract.out ? { out: [...node.contract.out] } : {}),
        }
      : undefined,
    value: deepClone(node.value),
    state: deepCloneRecord(node.state),
    meta: deepCloneRecord(node.meta),
  };
}

function cloneGraphEdge(edge: GraphEdge): GraphEdge {
  return {
    ...edge,
    meta: deepClone(edge.meta),
    context: deepClone(edge.context),
  };
}

function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = deepClone(item);
  }
  return out as T;
}

function deepCloneRecord<T extends Record<string, GraphValue>>(record: T): T {
  const out: Record<string, GraphValue> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = deepClone(value);
  }
  return out as T;
}

function isRecord(value: unknown): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exhaustiveNever(value: never): never {
  throw new Error(`Unexpected bind expression: ${JSON.stringify(value)}`);
}


type Phase7PathExpr = {
  name: "@path.has" | "@path.first" | "@path.count" | "@path.through";
  from: any;
  to: any;
  options: any | null;
};

function evaluatePhase7PathExpr(
  graph: Graph,
  expr: Phase7PathExpr,
  bindings: RuntimeBindings,
): BindValue {
  const start = resolveBindNodeId(expr.from, bindings);
  const target = resolveBindNodeId(expr.to, bindings);
  const options = readPathOptions(expr.options);
  const paths = findSimplePaths(graph, start, target, options);

  if (expr.name === "@path.has") return paths.length > 0;
  if (expr.name === "@path.count") return paths.length;

  const first = paths[0] ?? null;
  if (!first) return null;

  return {
    nodes: first.nodes,
    edges: first.edges,
    depth: first.edges.length,
  };
}

function resolveBindNodeId(value: any, bindings: RuntimeBindings): string {
  if (value?.type === "Identifier") {
    const bound = bindings.nodes.get(value.name);
    return bound?.id ?? value.name;
  }

  if (value?.type === "StringLiteral") return value.value;

  throw new Error("@path endpoints must be identifiers or string literals");
}

function readPathOptions(options: any): {
  relation: string | null;
  direction: "outgoing" | "incoming" | "both";
  depth: number;
  throughEdges: string[];
} {
  const out = { relation: null as string | null, direction: "outgoing" as "outgoing" | "incoming" | "both", depth: 1, throughEdges: [] as string[] };
  if (!options) return out;

  for (const prop of options.properties ?? []) {
    if (prop.key === "relation") {
      out.relation = valueNodeToString(prop.value);
    }
    if (prop.key === "direction") {
      const direction = valueNodeToString(prop.value);
      if (direction !== "outgoing" && direction !== "incoming" && direction !== "both") {
        throw new Error('@path direction must be "outgoing", "incoming", or "both"');
      }
      out.direction = direction;
    }
    if (prop.key === "depth") {
      if (prop.value.type !== "NumberLiteral" || !Number.isInteger(prop.value.value) || prop.value.value < 1) {
        throw new Error("@path depth must be a positive integer");
      }
      out.depth = prop.value.value;
    }
    if (prop.key === "edges") {
      if (prop.value.type !== "ArrayLiteral") throw new Error("@path.through edges must be an array");
      out.throughEdges = prop.value.elements.map(valueNodeToString);
    }
  }

  return out;
}

function valueNodeToString(value: any): string {
  if (value.type === "Identifier") return value.name;
  if (value.type === "StringLiteral") return value.value;
  throw new Error("Expected identifier or string literal");
}

function findSimplePaths(
  graph: Graph,
  start: string,
  target: string,
  options: { relation: string | null; direction: "outgoing" | "incoming" | "both"; depth: number; throughEdges: string[] },
): Array<{ nodes: string[]; edges: string[] }> {
  const results: Array<{ nodes: string[]; edges: string[] }> = [];
  const queue: Array<{ node: string; nodes: string[]; edges: string[] }> = [{ node: start, nodes: [start], edges: [] }];

  while (queue.length) {
    const current = queue.shift()!;
    if (current.edges.length > options.depth) continue;
    if (current.node === target && current.edges.length > 0 && satisfiesThroughEdges(current.edges, options.throughEdges)) {
      results.push({ nodes: current.nodes, edges: current.edges });
      continue;
    }
    if (current.edges.length === options.depth) continue;

    for (const edge of graph.edges) {
      const candidates: Array<{ next: string; edgeId: string }> = [];
      const edgeId = edge.id ?? `${edge.subject}:${edge.relation}:${edge.object}`;
      if (options.relation && options.relation !== "any" && edge.relation !== options.relation) continue;
      if (options.direction === "outgoing" || options.direction === "both") {
        if (edge.subject === current.node) candidates.push({ next: edge.object, edgeId });
      }
      if (options.direction === "incoming" || options.direction === "both") {
        if (edge.object === current.node) candidates.push({ next: edge.subject, edgeId });
      }
      for (const candidate of candidates) {
        if (current.nodes.includes(candidate.next)) continue;
        queue.push({ node: candidate.next, nodes: [...current.nodes, candidate.next], edges: [...current.edges, candidate.edgeId] });
      }
    }
  }

  return results;
}

function satisfiesThroughEdges(actualEdges: string[], requiredEdges: string[]): boolean {
  if (requiredEdges.length === 0) return true;
  let offset = 0;
  for (const required of requiredEdges) {
    const found = actualEdges.indexOf(required, offset);
    if (found === -1) return false;
    offset = found + 1;
  }
  return true;
}
