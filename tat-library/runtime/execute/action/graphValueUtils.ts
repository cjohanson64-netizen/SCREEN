import type { GraphValue } from "../../graph/graph.js";

export function dig(value: GraphValue, path: string[]): GraphValue {
  let current: GraphValue = value;

  for (const key of path) {
    if (!isRecord(current)) return null;
    if (!(key in current)) return null;
    current = current[key];
  }

  return current;
}

export function compareStrict(a: GraphValue, b: GraphValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function compareCaseInsensitive(a: GraphValue, b: GraphValue): boolean {
  return JSON.stringify(normalizeCaseInsensitive(a)) === JSON.stringify(normalizeCaseInsensitive(b));
}

export function compareNumeric(
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

export function normalizeCaseInsensitive(value: GraphValue): GraphValue {
  if (typeof value === "string") return value.toLowerCase();
  if (Array.isArray(value)) return value.map((item) => normalizeCaseInsensitive(item));
  if (isRecord(value)) {
    const out: Record<string, GraphValue> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = normalizeCaseInsensitive(v);
    }
    return out;
  }
  return value;
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

export function graphValueEquals(left: GraphValue, right: GraphValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function isRecord(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

