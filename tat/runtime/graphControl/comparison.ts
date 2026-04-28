import type { ComparisonExprNode } from "../../ast/nodeTypes.js";
import type { GraphValue } from "../graph.js";
import { exhaustiveNever, isRecord } from "./utils.js";

export function applyComparisonOperator(
  operator: ComparisonExprNode["operator"],
  left: GraphValue,
  right: GraphValue,
): boolean {
  switch (operator) {
    case "==":
      return compareCaseInsensitive(left, right);
    case "===":
      return compareStrict(left, right);
    case "!=":
      return !compareCaseInsensitive(left, right);
    case "!==":
      return !compareStrict(left, right);
    case "<":
    case "<=":
    case ">":
    case ">=":
      return compareNumeric(operator, left, right);
    default:
      return exhaustiveNever(operator);
  }
}

function compareNumeric(
  operator: "<" | "<=" | ">" | ">=",
  left: GraphValue,
  right: GraphValue,
): boolean {
  if (typeof left !== "number" || typeof right !== "number") {
    throw new Error(`Numeric comparison "${operator}" requires number operands`);
  }

  switch (operator) {
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
  }
}

function compareStrict(a: GraphValue, b: GraphValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareCaseInsensitive(a: GraphValue, b: GraphValue): boolean {
  return (
    JSON.stringify(normalizeCaseInsensitive(a)) ===
    JSON.stringify(normalizeCaseInsensitive(b))
  );
}

function normalizeCaseInsensitive(value: GraphValue): GraphValue {
  if (typeof value === "string") return value.toLowerCase();
  if (Array.isArray(value)) return value.map((item) => normalizeCaseInsensitive(item));
  if (isRecord(value)) {
    const out: Record<string, GraphValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = normalizeCaseInsensitive(entry);
    }
    return out;
  }
  return value;
}

