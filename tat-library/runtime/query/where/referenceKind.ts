import type { GraphValue } from "../../graph/graph.js";
import type { BooleanExprNode, BooleanValueNode } from "../../../ast/nodeTypes.js";

type WhereReferenceKind = "node" | "edge" | "mixed" | "unknown";

export function inferWhereReferenceKind(expr: BooleanExprNode): WhereReferenceKind {
  switch (expr.type) {
    case "BinaryBooleanExpr":
      return mergeWhereReferenceKinds(
        inferWhereReferenceKind(expr.left),
        inferWhereReferenceKind(expr.right),
      );

    case "UnaryBooleanExpr":
      return inferWhereReferenceKind(expr.argument);

    case "GroupedBooleanExpr":
      return inferWhereReferenceKind(expr.expression);

    case "ComparisonExpr":
      return mergeWhereReferenceKinds(
        inferWhereValueReferenceKind(expr.left),
        inferWhereValueReferenceKind(expr.right),
      );

    case "Identifier":
      if (expr.name === "node") return "node";
      if (expr.name === "edge") return "edge";
      return "unknown";

    case "PropertyAccess":
      if (expr.object.name === "node") return "node";
      if (expr.object.name === "edge") return "edge";
      return "unknown";

    default:
      return "unknown";
  }
}

function inferWhereValueReferenceKind(value: BooleanValueNode): WhereReferenceKind {
  switch (value.type) {
    case "Identifier":
      if (value.name === "node") return "node";
      if (value.name === "edge") return "edge";
      return "unknown";

    case "PropertyAccess":
      if (value.object.name === "node") return "node";
      if (value.object.name === "edge") return "edge";
      return "unknown";

    default:
      return "unknown";
  }
}

function mergeWhereReferenceKinds(
  left: WhereReferenceKind,
  right: WhereReferenceKind,
): WhereReferenceKind {
  if (left === "mixed" || right === "mixed") {
    return "mixed";
  }

  if (left === "unknown") {
    return right;
  }

  if (right === "unknown") {
    return left;
  }

  if (left !== right) {
    return "mixed";
  }

  return left;
}

export function truthy(value: GraphValue): boolean {
  if (value === null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return false;
}

export function stringifyGraphValue(value: GraphValue): string {
  if (value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function isRecord(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

