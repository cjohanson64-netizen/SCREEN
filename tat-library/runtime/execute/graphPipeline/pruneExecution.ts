import type {
  BooleanExprNode,
  BooleanValueNode,
  PruneEdgesExprNode,
  PruneNodesExprNode,
} from "../../../ast/nodeTypes.js";
import { removeNode, type Graph, type GraphEdge, type GraphNode, type GraphValue } from "../../graph/graph.js";
import type { RuntimeBindings } from "../../query/evaluateNodeCapture.js";
import type { RuntimeState } from "../../engine/runtimeState.js";
import { deepClone, isRecordValue } from "../../engine/runtimeClone.js";

export function executePruneNodesExpr(
  graph: Graph,
  mutation: PruneNodesExprNode,
  state: RuntimeState,
): void {
  const targets = Array.from(graph.nodes.values())
    .filter((node) =>
      evaluatePruneWhereNode(mutation.where.expression, node, state.bindings),
    )
    .map((node) => node.id);

  for (const nodeId of targets) {
    removeNode(graph, nodeId);
  }
}

export function executePruneEdgesExpr(
  graph: Graph,
  mutation: PruneEdgesExprNode,
  state: RuntimeState,
): void {
  const removeIds = new Set(
    graph.edges
      .filter((edge) =>
        evaluatePruneWhereEdge(mutation.where.expression, edge, state.bindings),
      )
      .map((edge) => edge.id),
  );

  graph.edges = graph.edges.filter((edge) => !removeIds.has(edge.id));
}

function evaluatePruneWhereNode(
  expr: BooleanExprNode,
  node: GraphNode,
  bindings: RuntimeBindings,
): boolean {
  return evaluatePruneExpr(expr, "node", node, bindings);
}

function evaluatePruneWhereEdge(
  expr: BooleanExprNode,
  edge: GraphEdge,
  bindings: RuntimeBindings,
): boolean {
  return evaluatePruneExpr(expr, "edge", edge, bindings);
}

function evaluatePruneExpr(
  expr: BooleanExprNode,
  context: "node" | "edge",
  item: GraphNode | GraphEdge,
  bindings: RuntimeBindings,
): boolean {
  switch (expr.type) {
    case "GroupedBooleanExpr":
      return evaluatePruneExpr(expr.expression, context, item, bindings);

    case "BinaryBooleanExpr":
      if (expr.operator === "&&") {
        return (
          evaluatePruneExpr(expr.left, context, item, bindings) &&
          evaluatePruneExpr(expr.right, context, item, bindings)
        );
      }
      if (expr.operator === "||") {
        return (
          evaluatePruneExpr(expr.left, context, item, bindings) ||
          evaluatePruneExpr(expr.right, context, item, bindings)
        );
      }
      throw new Error(
        `Malformed @where predicate syntax: unsupported boolean operator "${expr.operator}"`,
      );

    case "ComparisonExpr": {
      if (expr.operator !== "==" && expr.operator !== "!=") {
        throw new Error(
          `Malformed @where predicate syntax: unsupported comparison operator "${expr.operator}"`,
        );
      }

      const left = resolvePruneValue(expr.left, context, item, bindings);
      const right = resolvePruneValue(expr.right, context, item, bindings);

      const equal = comparePruneValue(left, right);
      return expr.operator === "==" ? equal : !equal;
    }

    default:
      throw new Error(
        `Malformed @where predicate syntax: expected comparisons grouped with && / ||`,
      );
  }
}

function resolvePruneValue(
  value: BooleanValueNode,
  context: "node" | "edge",
  item: GraphNode | GraphEdge,
  bindings: RuntimeBindings,
): GraphValue | undefined {
  switch (value.type) {
    case "StringLiteral":
      return value.value;

    case "NumberLiteral":
      return value.value;

    case "BooleanLiteral":
      return value.value;

    case "RegexLiteral":
      throw new Error(
        `Malformed @where predicate syntax: regex is not supported in prune predicates`,
      );

    case "Identifier":
      return resolveIdentifierOperand(value.name, context, item, bindings);

    case "PropertyAccess":
      return resolvePropertyOperand(value, context, item);

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
      throw new Error(
        `Malformed @where predicate syntax: derive expressions are not supported in prune predicates`,
      );

    default: {
      const _exhaustive: never = value;
      throw new Error(
        `Malformed @where predicate syntax: unsupported value ${JSON.stringify(_exhaustive)}`,
      );
    }
  }
}

function resolveIdentifierOperand(
  name: string,
  context: "node" | "edge",
  item: GraphNode | GraphEdge,
  bindings: RuntimeBindings,
): GraphValue | undefined {
  if (context === "node") {
    const node = item as GraphNode;
    if (name === "id") return node.id;
    if (name === "type") return readObjectField(node.value, "type");
    if (name === "key") return readObjectField(node.value, "key");
    if (name === "value") return node.value;
  }

  if (context === "edge") {
    const edge = item as GraphEdge;
    if (name === "source") return edge.subject;
    if (name === "target") return edge.object;
    if (name === "rel") return edge.relation;
  }

  if (bindings.nodes.has(name)) {
    return bindings.nodes.get(name)!.id;
  }

  if (bindings.values.has(name)) {
    return deepClone(bindings.values.get(name)!);
  }

  if (context === "node") {
    if (name === "source" || name === "target" || name === "rel") {
      throw new Error(`Invalid @where field for node prune: "${name}"`);
    }
  }

  if (context === "edge") {
    if (
      name === "id" ||
      name === "type" ||
      name === "key" ||
      name === "value" ||
      name === "state" ||
      name === "meta"
    ) {
      throw new Error(`Invalid @where field for edge prune: "${name}"`);
    }
  }

  throw new Error(`Unresolved symbol "${name}" in @where predicate`);
}

function resolvePropertyOperand(
  value: Extract<BooleanValueNode, { type: "PropertyAccess" }>,
  context: "node" | "edge",
  item: GraphNode | GraphEdge,
): GraphValue | undefined {
  if (context === "edge") {
    throw new Error(
      `Invalid @where field for edge prune: "${value.object.name}"`,
    );
  }

  const node = item as GraphNode;

  if (value.object.name === "state") {
    return digPruneValue(
      node.state,
      value.chain.map((part) => part.name),
    );
  }

  if (value.object.name === "meta") {
    return digPruneValue(
      node.meta,
      value.chain.map((part) => part.name),
    );
  }

  throw new Error(
    `Invalid @where field for node prune: "${value.object.name}"`,
  );
}

function readObjectField(
  value: GraphValue,
  field: string,
): GraphValue | undefined {
  if (!isRecordValue(value)) return undefined;
  if (!(field in value)) return undefined;
  return value[field];
}

function digPruneValue(
  value: GraphValue,
  path: string[],
): GraphValue | undefined {
  let current: GraphValue = value;
  for (const part of path) {
    if (!isRecordValue(current)) {
      return undefined;
    }
    if (!(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function comparePruneValue(
  a: GraphValue | undefined,
  b: GraphValue | undefined,
): boolean {
  if (a === undefined || b === undefined) {
    return false;
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

