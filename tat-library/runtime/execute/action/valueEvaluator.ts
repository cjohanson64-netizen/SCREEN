import type {
  ActionGuardExprNode,
  ActionPipelineStepNode,
  ActionProjectExprNode,
  AggregateQueryExprNode,
  ArrayLiteralNode,
  BooleanExprNode,
  BooleanValueNode,
  ComputeAbsExprNode,
  ComputeAvgExprNode,
  DeriveBinaryExprNode,
  DeriveCollectExprNode,
  ComputeCountExprNode,
  ComputeEdgeCountExprNode,
  ComputeExistsExprNode,
  ComputeMaxExprNode,
  DeriveMetaExprNode,
  ComputeMinExprNode,
  DerivePathExprNode,
  DeriveStateExprNode,
  GraphControlExprNode,
  ObjectLiteralNode,
  PropertyAccessNode,
  StringLiteralNode,
  ComputeSumExprNode,
  ValueExprNode,
  ComputeSourceNode,
} from "../../../ast/nodeTypes.js";
import { cloneGraphValue, type Graph, type GraphNode, type GraphValue } from "../../graph/graph.js";
import { LOOP_SAFETY_CAP } from "../../graphControl/constants.js";
import { evaluateGraphControlExpr } from "../../graphControl/controlEvaluator.js";
import { evaluateDeriveExpr } from "../../graphControl/deriveEvaluator.js";
import { evaluateGraphQuery } from "../../graphControl/queryEvaluator.js";
import type { ActionScope } from "./types.js";
import {
  compareCaseInsensitive,
  compareNumeric,
  compareStrict,
  dig,
  graphValueEquals,
  isRecord,
  stringifyGraphValue,
  truthy,
} from "./graphValueUtils.js";
import {
  cloneNodeContract,
  contractToGraphValue,
  extractRuntimeNodeValue,
  printNodeCapture,
} from "./runtimeNode.js";

export {
  cloneNodeContract,
  contractToGraphValue,
  extractRuntimeNodeValue,
} from "./runtimeNode.js";

export { isRecord } from "./graphValueUtils.js";

export function evaluateActionGuard(
  expr: ActionGuardExprNode,
  graph: Graph,
  scope: ActionScope,
): boolean {
  if (expr.type === "GraphQueryExpr") {
    return evaluateGraphQuery(graph, expr, { scope });
  }

  switch (expr.type) {
    case "BinaryBooleanExpr":
      if (expr.operator === "&&") {
        return (
          evaluateActionGuard(expr.left, graph, scope) &&
          evaluateActionGuard(expr.right, graph, scope)
        );
      }
      return (
        evaluateActionGuard(expr.left, graph, scope) ||
        evaluateActionGuard(expr.right, graph, scope)
      );

    case "UnaryBooleanExpr":
      return !evaluateActionGuard(expr.argument, graph, scope);

    case "GroupedBooleanExpr":
      return evaluateActionGuard(expr.expression, graph, scope);

    case "ComparisonExpr": {
      const left = evaluateBooleanValue(expr.left, graph, scope);
      const right = evaluateBooleanValue(expr.right, graph, scope);

      switch (expr.operator) {
        case "==":
          return compareCaseInsensitive(left, right);
        case "===":
          return compareStrict(left, right);
        case "!=":
          return !compareCaseInsensitive(left, right);
        case "!==":
          return !compareStrict(left, right);
        case "<":
          return compareNumeric("<", left, right);
        case "<=":
          return compareNumeric("<=", left, right);
        case ">":
          return compareNumeric(">", left, right);
        case ">=":
          return compareNumeric(">=", left, right);
      }
    }

    case "Identifier":
      return truthy(resolveIdentifierValue(expr.name, graph, scope));

    case "PropertyAccess":
      return truthy(resolvePropertyAccess(expr, graph, scope));

    case "StringLiteral":
      return truthy(expr.value);

    case "NumberLiteral":
      return truthy(expr.value);

    case "BooleanLiteral":
      return expr.value;

    case "RegexLiteral":
      return truthy(expr.raw);
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
      return truthy(evaluateActionDeriveExpr(graph, expr, scope));
    default:
      return exhaustiveNever(expr);
  }
}

function evaluateBooleanValue(
  value: BooleanValueNode,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  switch (value.type) {
    case "Identifier":
      return resolveIdentifierValue(value.name, graph, scope);
    case "PropertyAccess":
      return resolvePropertyAccess(value, graph, scope);
    case "StringLiteral":
      return value.value;
    case "NumberLiteral":
      return value.value;
    case "BooleanLiteral":
      return value.value;
    case "RegexLiteral":
      return value.raw;
    case "DeriveStateExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "DeriveMetaExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeCountExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeEdgeCountExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeExistsExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "DerivePathExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "DeriveCollectExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeSumExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeMinExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeMaxExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeAvgExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "ComputeAbsExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    case "DeriveBinaryExpr":
      return evaluateActionDeriveExpr(graph, value, scope);
    default:
      return exhaustiveNever(value);
  }
}

function evaluateActionDeriveExpr(
  graph: Graph,
  expr: Extract<
    BooleanValueNode,
    {
      type:
        | "DeriveStateExpr"
        | "DeriveMetaExpr"
        | "ComputeCountExpr"
        | "ComputeEdgeCountExpr"
        | "ComputeExistsExpr"
        | "DerivePathExpr"
        | "DeriveCollectExpr"
        | "ComputeSumExpr"
        | "ComputeMinExpr"
        | "ComputeMaxExpr"
        | "ComputeAvgExpr"
        | "ComputeAbsExpr"
        | "DeriveBinaryExpr";
    }
  >,
  scope: ActionScope,
): GraphValue {
  switch (expr.type) {
    case "DeriveStateExpr": {
      if (!expr.node || !expr.key) {
        throw new Error("@derive.state requires node and key");
      }
      const nodeId = resolveScopedIdentifier(expr.node.name, scope);
      const node = graph.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Graph node "${nodeId}" does not exist`);
      }
      if (!Object.prototype.hasOwnProperty.call(node.state, expr.key.value)) {
        throw new Error(
          `@derive.state could not find state key "${expr.key.value}" on node "${nodeId}"`,
        );
      }
      return node.state[expr.key.value];
    }

    case "DeriveMetaExpr": {
      if (!expr.node || !expr.key) {
        throw new Error("@derive.meta requires node and key");
      }
      const nodeId = resolveScopedIdentifier(expr.node.name, scope);
      const node = graph.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Graph node "${nodeId}" does not exist`);
      }
      if (!Object.prototype.hasOwnProperty.call(node.meta, expr.key.value)) {
        throw new Error(
          `@derive.meta could not find meta key "${expr.key.value}" on node "${nodeId}"`,
        );
      }
      return node.meta[expr.key.value];
    }

    case "ComputeCountExpr": {
      if (expr.from) {
        return evaluateActionAggregateSource(graph, expr.from, scope).length;
      }
      if (!expr.nodes) {
        throw new Error("@compute.count requires a nodes field or from field");
      }
      return evaluateActionDerivePath(graph, expr.nodes, scope).length;
    }

    case "ComputeEdgeCountExpr": {
      if (!expr.node || !expr.relation || !expr.direction) {
        throw new Error("@compute.edgeCount requires node, relation, and direction");
      }
      const nodeId = resolveScopedIdentifier(expr.node.name, scope);
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
        return evaluateActionEdgeWhereExpr(graph, edge, expr.where, scope);
      });
      if (expr.direction.value === "incoming" || expr.direction.value === "outgoing") {
        return matchingEdges.length;
      }
      throw new Error('@compute.edgeCount direction must be "incoming" or "outgoing"');
    }

    case "ComputeExistsExpr":
      if (!expr.path) {
        throw new Error("@compute.exists requires a path field");
      }
      if (expr.path.type === "Identifier") {
        const collection = scope.payload?.[expr.path.name];
        if (!Array.isArray(collection)) {
          throw new Error(`@compute.exists source "${expr.path.name}" must resolve to an array`);
        }
        return collection.length > 0;
      }
      return evaluateActionDerivePath(graph, expr.path, scope).length > 0;

    case "DerivePathExpr":
      return evaluateActionDerivePath(graph, expr, scope);

    case "DeriveCollectExpr":
      return evaluateActionDeriveCollect(graph, expr, scope);

    case "ComputeSumExpr":
      return evaluateActionComputeSum(graph, expr, scope);

    case "ComputeMinExpr":
      return evaluateActionFieldAggregate(graph, expr.from, expr.field, scope, "@compute.min", "min");

    case "ComputeMaxExpr":
      return evaluateActionFieldAggregate(graph, expr.from, expr.field, scope, "@compute.max", "max");

    case "ComputeAvgExpr":
      return evaluateActionFieldAggregate(graph, expr.from, expr.field, scope, "@compute.avg", "avg");

    case "ComputeAbsExpr": {
      if (!expr.value) {
        throw new Error("@compute.abs requires a value expression");
      }
      const value = evaluateActionDeriveOperand(graph, expr.value, scope);
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("@compute.abs requires a numeric value");
      }
      return Math.abs(value);
    }

    case "DeriveBinaryExpr": {
      const left = evaluateActionDeriveOperand(graph, expr.left, scope);
      const right = evaluateActionDeriveOperand(graph, expr.right, scope);

      if (expr.operator === "+") {
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" || typeof right === "string") {
          return `${stringifyGraphValue(left)}${stringifyGraphValue(right)}`;
        }
        throw new Error('Derive operator "+" requires number or string operands');
      }

      return evaluateActionNumericBinary(expr.operator, left, right);
    }
  }

  return exhaustiveNever(expr);
}

function evaluateActionAggregateSource(
  graph: Graph,
  source: ComputeSourceNode,
  scope: ActionScope,
): string[] {
  if (source.type === "DerivePathExpr") {
    return evaluateActionDerivePath(graph, source, scope);
  }

  if (source.type === "Identifier") {
    const collection = scope.payload?.[source.name];
    if (!Array.isArray(collection)) {
      throw new Error(`Compute source "${source.name}" must resolve to an array`);
    }
    return collection.flatMap((entry) => {
      if (typeof entry === "string") {
        return [entry];
      }
      if (isRecord(entry) && typeof entry.id === "string") {
        return [entry.id];
      }
      return [];
    });
  }

  if (!source.typeName) {
    throw new Error('@query(...) compute source requires a "type" field');
  }

  const ids: string[] = [];
  for (const node of graph.nodes.values()) {
    if (isRecord(node.value) && node.value.type === source.typeName.value) {
      ids.push(node.id);
    }
  }
  return ids;
}

function evaluateActionDerivePath(
  graph: Graph,
  expr: DerivePathExprNode,
  scope: ActionScope,
): string[] {
  if (!expr.node || !expr.relation || !expr.direction || !expr.depth) {
    throw new Error("@derive.path requires node, relation, direction, and depth");
  }

  const startNodeId = resolveScopedIdentifier(expr.node.name, scope);
  const relations = resolveActionPathRelations(expr.relation);
  const direction = expr.direction.value;
  const maxDepth = expr.depth.value;

  if (!Number.isInteger(maxDepth) || maxDepth < 1) {
    throw new Error("@derive.path depth must be an integer >= 1");
  }

  if (direction !== "incoming" && direction !== "outgoing" && direction !== "both") {
    throw new Error('@derive.path direction must be "incoming", "outgoing", or "both"');
  }

  const visited = new Set<string>([startNodeId]);
  const results = new Set<string>();
  let frontier = [startNodeId];

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const nextFrontier: string[] = [];

    for (const currentNodeId of frontier) {
      for (const nextNodeId of collectActionPathNeighbors(graph, currentNodeId, relations, direction)) {
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
    evaluateActionPathWhereExpr(graph, candidateId, expr.where!, scope),
  );
}

function evaluateActionDeriveCollect(
  graph: Graph,
  expr: DeriveCollectExprNode,
  scope: ActionScope,
): GraphValue[] {
  if (!expr.path || !expr.layer || !expr.key) {
    throw new Error("@derive.collect requires path, layer, and key");
  }

  const layer = expr.layer.value;
  if (layer !== "value" && layer !== "state" && layer !== "meta") {
    throw new Error('@derive.collect layer must be "value", "state", or "meta"');
  }

  const values: GraphValue[] = [];
  for (const nodeId of evaluateActionDerivePath(graph, expr.path, scope)) {
    const node = graph.nodes.get(nodeId);
    if (!node) continue;
    const source =
      layer === "value" ? node.value : layer === "state" ? node.state : node.meta;
    if (!isRecord(source) || !Object.prototype.hasOwnProperty.call(source, expr.key.value)) {
      continue;
    }
    values.push(source[expr.key.value]);
  }

  return values;
}

function evaluateActionComputeSum(
  graph: Graph,
  expr: ComputeSumExprNode,
  scope: ActionScope,
): number {
  if (expr.from) {
    return evaluateActionFieldAggregate(graph, expr.from, expr.field, scope, "@compute.sum", "sum") as number;
  }

  if (!expr.collect) {
    throw new Error("@compute.sum requires a collect field or from/field");
  }

  let total = 0;
  for (const value of evaluateActionDeriveCollect(graph, expr.collect, scope)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("@compute.sum requires all collected values to be numeric");
    }
    total += value;
  }

  return total;
}

function evaluateActionFieldAggregate(
  graph: Graph,
  source: ComputeSourceNode | null,
  field: StringLiteralNode | null,
  scope: ActionScope,
  opName: string,
  mode: "sum" | "min" | "max" | "avg",
): GraphValue {
  if (!source) {
    throw new Error(`${opName} requires a from field`);
  }
  if (!field) {
    throw new Error(`${opName} requires a field field`);
  }

  const ids = evaluateActionAggregateSource(graph, source, scope);
  const values: number[] = [];
  for (const nodeId of ids) {
    const node = graph.nodes.get(nodeId);
    if (!node) continue;
    const value = resolveActionAggregateFieldValue(node, field.value);
    if (typeof value === "number" && Number.isFinite(value)) {
      values.push(value);
    }
  }

  switch (mode) {
    case "sum":
      return values.reduce((total, value) => total + value, 0);
    case "min":
      return values.length ? Math.min(...values) : null;
    case "max":
      return values.length ? Math.max(...values) : null;
    case "avg":
      return values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0;
  }
}

function resolveActionAggregateFieldValue(
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

function evaluateActionDeriveOperand(
  graph: Graph,
  expr: DeriveBinaryExprNode["left"],
  scope: ActionScope,
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
      return evaluateActionDeriveExpr(graph, expr, scope);
    default:
      return exhaustiveNever(expr);
  }
}

function evaluateActionNumericBinary(
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

function resolveActionPathRelations(
  relation: StringLiteralNode | ArrayLiteralNode,
): string[] {
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

function collectActionPathNeighbors(
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

function evaluateActionPathWhereExpr(
  graph: Graph,
  nodeId: string,
  where: BooleanExprNode,
  scope: ActionScope,
): boolean {
  const node = graph.nodes.get(nodeId);
  if (!node) {
    return false;
  }

  const localScope: ActionScope = {
    ...scope,
    node: {
      id: node.id,
      value: node.value,
      state: node.state,
      meta: node.meta,
    },
  };

  switch (where.type) {
    case "BinaryBooleanExpr":
    case "UnaryBooleanExpr":
    case "GroupedBooleanExpr":
    case "ComparisonExpr":
      return evaluateActionGuard(where, graph, localScope);
    default: {
      const result = evaluateBooleanValue(where, graph, localScope);
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

export function evaluateActionProjectExpr(
  expr: ActionProjectExprNode | ValueExprNode,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  switch (expr.type) {
    case "Identifier":
      return resolveIdentifierValue(expr.name, graph, scope);

    case "PropertyAccess":
      return resolvePropertyAccess(expr, graph, scope);

    case "StringLiteral":
      return expr.value;

    case "NumberLiteral":
      return expr.value;

    case "BooleanLiteral":
      return expr.value;

    case "RuntimeGenerateValueIdExpr":
      return generateRuntimeValueId(expr, scope);

    case "RuntimeNextOrderExpr":
      return getNextRuntimeOrder(graph);

    case "NodeCapture":
      return printNodeCapture(expr);

    case "ObjectLiteral":
      return evaluateObjectLiteralProject(expr, graph, scope);

    case "ArrayLiteral":
      return evaluateArrayLiteralProject(expr, graph, scope);

    case "RuntimeGenerateNodeIdExpr":
      return `@runtime.generateNodeId(${expr.prefix?.raw ?? ""})`;

    case "WhereExpr":
      throw new Error(`@where is not supported inside @action project expressions`);

    case "ChooseExpr":
      throw new Error(`@if is not supported inside @action project expressions`);

    case "DirectiveCallExpr":
      throw new Error(`${expr.name} is not supported inside @action project expressions`);

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
      return evaluateDeriveExpr(graph, expr, {
        scope,
      });
    case "CurrentValue":
    case "PreviousValue":
      throw new Error(`Unsupported project expression "${expr.type}"`);

    default:
      return exhaustiveNever(expr);
  }
}

function evaluateArrayLiteralProject(
  expr: ArrayLiteralNode,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  return expr.elements.map((el) => evaluateActionProjectExpr(el, graph, scope));
}

function evaluateObjectLiteralProject(
  expr: ObjectLiteralNode,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  const out: Record<string, GraphValue> = {};

  for (const prop of expr.properties) {
    out[prop.key] = evaluateActionProjectExpr(prop.value, graph, scope);
  }

  return out;
}

function resolveIdentifierValue(
  name: string,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  if (name === "node" && scope.node) {
    return scope.node;
  }
  if (name === "payload") {
    return scope.payload ?? {};
  }
  const resolved = resolveScopedIdentifier(name, scope);
  return resolved;
}

function generateRuntimeValueId(
  expr: Extract<ActionProjectExprNode, { type: "RuntimeGenerateValueIdExpr" }>,
  scope: ActionScope,
): string {
  const prefix = expr.prefix?.value?.trim() || "value";
  const sanitizedTarget = resolveScopedIdentifier("to", scope)
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${prefix}_${sanitizedTarget || "node"}`;
}

function generateRuntimeNodeId(
  graph: Graph,
  expr: { prefix: { value: string } | null },
): string {
  const prefix = expr.prefix?.value?.trim() || "node";
  const counter = graph.history.length + 1;
  return `${prefix}Node_${counter}`;
}

function getNextRuntimeOrder(graph: Graph): number {
  const highest = Array.from(graph.nodes.values()).reduce((max, node) => {
    const order = node.meta?.order;
    return typeof order === "number" && Number.isFinite(order)
      ? Math.max(max, order)
      : max;
  }, 0);

  return highest + 1;
}

export function resolveScopedIdentifier(name: string, scope: ActionScope): string {
  if (name === "from") return scope.from;
  if (name === "to") {
    if (!scope.to) {
      throw new Error('Action scope is missing "to"');
    }
    return scope.to;
  }
  if (name === "node" && scope.node) {
    const nodeId = scope.node.id;
    if (typeof nodeId === "string") {
      return nodeId;
    }
    throw new Error('Action scope "node" is missing a string id');
  }
  return name;
}

function evaluateActionEdgeWhereExpr(
  graph: Graph,
  edge: Graph["edges"][number],
  where: BooleanExprNode,
  scope: ActionScope,
): boolean {
  const result = evaluateGraphControlExpr(graph, where, {
    scope,
    bindings: {
      values: new Map([
        [
          "edge",
          {
            id: edge.id,
            from: edge.subject,
            to: edge.object,
            relation: edge.relation,
            kind: edge.kind,
            meta: cloneGraphValue(edge.meta),
            context: edge.context === null ? null : cloneGraphValue(edge.context),
          },
        ],
      ]),
      nodes: new Map(),
    },
  });

  if (typeof result !== "boolean") {
    throw new Error("@compute.edgeCount where must evaluate to a boolean");
  }

  return result;
}

export function resolveRuntimeAddNodeTarget(
  graph: Graph,
  target: Extract<ActionPipelineStepNode, { type: "RuntimeAddNodeExpr" }>["node"],
  scope: ActionScope,
): string {
  if (target.type === "Identifier") {
    return resolveScopedIdentifier(target.name, scope);
  }

  if (scope.to) {
    return scope.to;
  }

  const generatedNodeId = generateRuntimeNodeId(graph, target);
  scope.to = generatedNodeId;
  return generatedNodeId;
}

function resolvePropertyAccess(
  access: PropertyAccessNode,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  const base = resolveIdentifierValue(access.object.name, graph, scope);

  if (isRecord(base)) {
    return dig(base, access.chain.map((part) => part.name));
  }

  if (typeof base === "string" && graph.nodes.has(base)) {
    const node = graph.nodes.get(base)!;
    const first = access.chain[0]?.name;
    if (!first) return null;

    if (first === "state") {
      return dig(node.state, access.chain.slice(1).map((p) => p.name));
    }

    if (first === "meta") {
      return dig(node.meta, access.chain.slice(1).map((p) => p.name));
    }

    if (first === "value") {
      return dig(node.value, access.chain.slice(1).map((p) => p.name));
    }

    if (first in node.state) {
      return dig(node.state, access.chain.map((p) => p.name));
    }

    if (first in node.meta) {
      return dig(node.meta, access.chain.map((p) => p.name));
    }

    if (isRecord(node.value) && first in node.value) {
      return dig(node.value, access.chain.map((p) => p.name));
    }
  }

  return null;
}

function evaluateActionValue(
  value: ValueExprNode,
  graph: Graph,
  scope: ActionScope,
): GraphValue {
  switch (value.type) {
    case "Identifier":
      return resolveIdentifierValue(value.name, graph, scope);
    case "PropertyAccess":
      return resolvePropertyAccess(value, graph, scope);
    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
      return value.value;
    case "ObjectLiteral": {
      const out: Record<string, GraphValue> = {};
      for (const property of value.properties) {
        out[property.key] = evaluateActionValue(property.value, graph, scope);
      }
      return out;
    }
    case "ArrayLiteral":
      return value.elements.map((element) => evaluateActionValue(element, graph, scope));
    case "ChooseExpr":
    case "DirectiveCallExpr":
      throw new Error(`Unsupported value expression "${value.type}" in action derive filter`);
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
      return evaluateDeriveExpr(graph, value, { scope });
    default:
      throw new Error(`Unsupported value expression "${value.type}" in action derive filter`);
  }
}


function exhaustiveNever(value: never): never {
  throw new Error(`Unexpected node shape: ${String(value)}`);
}
