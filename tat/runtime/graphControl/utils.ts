import type { GraphValue } from "../graph.js";

export function graphValueEquals(left: GraphValue, right: GraphValue): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
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

export function dig(value: GraphValue, path: string[]): GraphValue {
  let current: GraphValue = value;
  for (const key of path) {
    if (!isRecord(current)) return null;
    if (!(key in current)) return null;
    current = current[key];
  }
  return current;
}

export function stringifyGraphValue(value: GraphValue): string {
  if (value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function isRecord(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function exhaustiveNever(value: never): never {
  throw new Error(`Unsupported graph control node: ${JSON.stringify(value)}`);
}

