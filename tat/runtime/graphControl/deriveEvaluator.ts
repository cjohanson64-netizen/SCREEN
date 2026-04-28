import type {
  DeriveAbsExprNode,
  DeriveAvgExprNode,
  DeriveBinaryExprNode,
  DeriveCollectExprNode,
  DeriveCountExprNode,
  DeriveEdgeCountExprNode,
  DeriveExprNode,
  DeriveExistsExprNode,
  DeriveMaxExprNode,
  DeriveMetaExprNode,
  DeriveMinExprNode,
  DerivePathExprNode,
  DeriveStateExprNode,
  DeriveSumExprNode,
  BooleanValueNode,
  GraphControlExprNode,
} from "../../ast/nodeTypes.js";
import type { Graph, GraphValue } from "../graph.js";
import { getNode } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import {
  collectAggregateFieldValues,
  evaluateDeriveAggregateSource,
  resolveAggregateCollection,
} from "./aggregateEvaluator.js";
import { resolveNodeRef } from "./nodeResolution.js";
import { evaluateDerivePath } from "./pathTraversal.js";
import { evaluateEdgeWhereExpr } from "./whereEvaluator.js";
import { exhaustiveNever, isRecord, stringifyGraphValue } from "./utils.js";

export function evaluateDeriveState(
  graph: Graph,
  expr: DeriveStateExprNode,
  options?: GraphControlOptions,
): GraphValue {
  if (!expr.node) {
    throw new Error("@derive.state requires a node field");
  }

  if (!expr.key) {
    throw new Error("@derive.state requires a key field");
  }

  const nodeId = resolveNodeRef(expr.node.name, options?.scope, options?.bindings);
  const node = getNode(graph, nodeId);

  if (!Object.prototype.hasOwnProperty.call(node.state, expr.key.value)) {
    throw new Error(
      `@derive.state could not find state key "${expr.key.value}" on node "${nodeId}"`,
    );
  }

  return node.state[expr.key.value];
}

export function evaluateDeriveMeta(
  graph: Graph,
  expr: DeriveMetaExprNode,
  options?: GraphControlOptions,
): GraphValue {
  if (!expr.node) {
    throw new Error("@derive.meta requires a node field");
  }

  if (!expr.key) {
    throw new Error("@derive.meta requires a key field");
  }

  const nodeId = resolveNodeRef(expr.node.name, options?.scope, options?.bindings);
  const node = getNode(graph, nodeId);

  if (!Object.prototype.hasOwnProperty.call(node.meta, expr.key.value)) {
    throw new Error(
      `@derive.meta could not find meta key "${expr.key.value}" on node "${nodeId}"`,
    );
  }

  return node.meta[expr.key.value];
}

export function evaluateDeriveCount(
  graph: Graph,
  expr: DeriveCountExprNode,
  options?: GraphControlOptions,
): number {
  if (expr.from) {
    return evaluateDeriveAggregateSource(graph, expr.from, options).length;
  }

  if (!expr.nodes) {
    throw new Error("@derive.count requires a nodes field or from field");
  }

  return evaluateDerivePath(graph, expr.nodes, options).length;
}

export function evaluateDeriveEdgeCount(
  graph: Graph,
  expr: DeriveEdgeCountExprNode,
  options?: GraphControlOptions,
): number {
  if (!expr.node) {
    throw new Error("@derive.edgeCount requires a node field");
  }

  if (!expr.relation) {
    throw new Error("@derive.edgeCount requires a relation field");
  }

  if (!expr.direction) {
    throw new Error("@derive.edgeCount requires a direction field");
  }

  const nodeId = resolveNodeRef(expr.node.name, options?.scope, options?.bindings);
  const relation = expr.relation.value;

  const matchingEdges = graph.edges.filter((edge) => {
    if (edge.relation !== relation) {
      return false;
    }

    if (expr.direction?.value === "incoming" && edge.object !== nodeId) {
      return false;
    }

    if (expr.direction?.value === "outgoing" && edge.subject !== nodeId) {
      return false;
    }

    if (!expr.where) {
      return true;
    }

    return evaluateEdgeWhereExpr(graph, edge, expr.where, options);
  });

  switch (expr.direction.value) {
    case "incoming":
    case "outgoing":
      return matchingEdges.length;
    default:
      throw new Error('@derive.edgeCount direction must be "incoming" or "outgoing"');
  }
}

export function evaluateDeriveExists(
  graph: Graph,
  expr: DeriveExistsExprNode,
  options?: GraphControlOptions,
): boolean {
  if (!expr.path) {
    throw new Error("@derive.exists requires a path field");
  }

  if (expr.path.type === "Identifier") {
    return resolveAggregateCollection(expr.path.name, options).length > 0;
  }

  return evaluateDerivePath(graph, expr.path, options).length > 0;
}

export function evaluateDeriveCollect(
  graph: Graph,
  expr: DeriveCollectExprNode,
  options?: GraphControlOptions,
): GraphValue[] {
  if (!expr.path || !expr.layer || !expr.key) {
    throw new Error("@derive.collect requires path, layer, and key");
  }

  const layer = expr.layer.value;
  if (layer !== "value" && layer !== "state" && layer !== "meta") {
    throw new Error('@derive.collect layer must be "value", "state", or "meta"');
  }

  const nodeIds = evaluateDerivePath(graph, expr.path, options);
  const results: GraphValue[] = [];

  for (const nodeId of nodeIds) {
    const node = graph.nodes.get(nodeId);
    if (!node) {
      continue;
    }

    const source =
      layer === "value" ? node.value : layer === "state" ? node.state : node.meta;

    if (!isRecord(source) || !Object.prototype.hasOwnProperty.call(source, expr.key.value)) {
      continue;
    }

    results.push(source[expr.key.value]);
  }

  return results;
}

export function evaluateDeriveSum(
  graph: Graph,
  expr: DeriveSumExprNode,
  options?: GraphControlOptions,
): number {
  if (expr.from) {
    const values = collectAggregateFieldValues(graph, expr.from, expr.field, options);
    return values.reduce((total, value) => total + value, 0);
  }

  if (!expr.collect) {
    throw new Error("@derive.sum requires a collect field or from/field");
  }

  const values = evaluateDeriveCollect(graph, expr.collect, options);
  let total = 0;
  for (const value of values) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("@derive.sum requires all collected values to be numeric");
    }
    total += value;
  }
  return total;
}

export function evaluateDeriveMin(
  graph: Graph,
  expr: DeriveMinExprNode,
  options?: GraphControlOptions,
): GraphValue {
  const values = collectAggregateFieldValues(graph, expr.from, expr.field, options, "@derive.min");
  if (values.length === 0) {
    return null;
  }
  return Math.min(...values);
}

export function evaluateDeriveMax(
  graph: Graph,
  expr: DeriveMaxExprNode,
  options?: GraphControlOptions,
): GraphValue {
  const values = collectAggregateFieldValues(graph, expr.from, expr.field, options, "@derive.max");
  if (values.length === 0) {
    return null;
  }
  return Math.max(...values);
}

export function evaluateDeriveAvg(
  graph: Graph,
  expr: DeriveAvgExprNode,
  options?: GraphControlOptions,
): number {
  const values = collectAggregateFieldValues(graph, expr.from, expr.field, options, "@derive.avg");
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function evaluateDeriveAbs(
  graph: Graph,
  expr: DeriveAbsExprNode,
  options?: GraphControlOptions,
): number {
  if (!expr.value) {
    throw new Error("@derive.abs requires a value expression");
  }

  const value = evaluateDeriveOperand(graph, expr.value, options);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("@derive.abs requires a numeric value");
  }

  return Math.abs(value);
}

export function evaluateDeriveExpr(
  graph: Graph,
  expr:
    | DeriveStateExprNode
    | DeriveMetaExprNode
    | DeriveCountExprNode
    | DeriveEdgeCountExprNode
    | DeriveExistsExprNode
    | DerivePathExprNode
    | DeriveCollectExprNode
    | DeriveSumExprNode
    | DeriveMinExprNode
    | DeriveMaxExprNode
    | DeriveAvgExprNode
    | DeriveAbsExprNode
    | DeriveBinaryExprNode,
  options?: GraphControlOptions,
): GraphValue {
  switch (expr.type) {
    case "DeriveStateExpr":
      return evaluateDeriveState(graph, expr, options);

    case "DeriveMetaExpr":
      return evaluateDeriveMeta(graph, expr, options);

    case "DeriveCountExpr":
      return evaluateDeriveCount(graph, expr, options);

    case "DeriveEdgeCountExpr":
      return evaluateDeriveEdgeCount(graph, expr, options);

    case "DeriveExistsExpr":
      return evaluateDeriveExists(graph, expr, options);

    case "DerivePathExpr":
      return evaluateDerivePath(graph, expr, options);

    case "DeriveCollectExpr":
      return evaluateDeriveCollect(graph, expr, options);

    case "DeriveSumExpr":
      return evaluateDeriveSum(graph, expr, options);

    case "DeriveMinExpr":
      return evaluateDeriveMin(graph, expr, options);

    case "DeriveMaxExpr":
      return evaluateDeriveMax(graph, expr, options);

    case "DeriveAvgExpr":
      return evaluateDeriveAvg(graph, expr, options);

    case "DeriveAbsExpr":
      return evaluateDeriveAbs(graph, expr, options);

    case "DeriveBinaryExpr": {
      const left = evaluateDeriveOperand(graph, expr.left, options);
      const right = evaluateDeriveOperand(graph, expr.right, options);

      if (expr.operator === "+") {
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }

        if (typeof left === "string" || typeof right === "string") {
          return `${stringifyGraphValue(left)}${stringifyGraphValue(right)}`;
        }

        throw new Error(`Cannot apply "+" to non-string/non-number derive values`);
      }

      return evaluateNumericBinary(expr.operator, left, right);
    }

    default:
      return exhaustiveNever(expr);
  }
}

function evaluateDeriveOperand(
  graph: Graph,
  expr: DeriveExprNode | GraphControlExprNode | BooleanValueNode,
  options?: GraphControlOptions,
): GraphValue {
  switch (expr.type) {
    case "CurrentValue":
      throw new Error('"current" is only available inside effect derive expressions');
    case "PreviousValue":
      throw new Error('"previous" is only available inside effect derive expressions');
    case "StringLiteral":
      return expr.value;
    case "NumberLiteral":
      return expr.value;
    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "DeriveCountExpr":
    case "DeriveEdgeCountExpr":
    case "DeriveExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "DeriveSumExpr":
    case "DeriveMinExpr":
    case "DeriveMaxExpr":
    case "DeriveAvgExpr":
    case "DeriveAbsExpr":
    case "DeriveBinaryExpr":
      return evaluateDeriveExpr(graph, expr, options);
    default:
      throw new Error(`Unsupported derive operand "${expr.type}"`);
  }
}

function evaluateNumericBinary(
  operator: DeriveBinaryExprNode["operator"],
  left: GraphValue,
  right: GraphValue,
): number {
  if (typeof left !== "number" || typeof right !== "number") {
    throw new Error(`Numeric derive expressions require number operands`);
  }

  switch (operator) {
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
    case "%":
      return left % right;
    default:
      throw new Error(`Unsupported numeric derive operator "${operator}"`);
  }
}
