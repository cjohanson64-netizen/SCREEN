import type { NodeCaptureNode } from "../../../ast/nodeTypes.js";
import type { GraphNodeContract, GraphValue } from "../../graph/graph.js";
import { cloneGraphValue } from "../../graph/graph.js";
import { isRecord } from "./graphValueUtils.js";
import type { ExtractedRuntimeNodeValue } from "./types.js";

export function extractRuntimeNodeValue(value: GraphValue): ExtractedRuntimeNodeValue {
  if (!isRecord(value)) {
    return { value };
  }

  const nextValue = cloneGraphValue(value);
  const semanticIdValue = nextValue.semanticId;
  const contractValue = nextValue.contract;

  if (semanticIdValue !== undefined && typeof semanticIdValue !== "string") {
    throw new Error("semanticId must be a string when present on a runtime node value");
  }

  if (contractValue !== undefined && !isNodeContractValue(contractValue)) {
    throw new Error("contract must be an object with optional string-array in/out fields");
  }

  delete nextValue.semanticId;
  delete nextValue.contract;

  return {
    ...(typeof semanticIdValue === "string" ? { semanticId: semanticIdValue } : {}),
    ...(contractValue ? { contract: normalizeNodeContract(contractValue) } : {}),
    value: nextValue,
  };
}

function isNodeContractValue(value: GraphValue): value is Record<string, GraphValue> {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.in !== undefined &&
    (!Array.isArray(value.in) || value.in.some((item) => typeof item !== "string"))
  ) {
    return false;
  }

  if (
    value.out !== undefined &&
    (!Array.isArray(value.out) || value.out.some((item) => typeof item !== "string"))
  ) {
    return false;
  }

  return true;
}

function normalizeNodeContract(value: Record<string, GraphValue>): GraphNodeContract {
  return {
    ...(Array.isArray(value.in) ? { in: [...value.in] as string[] } : {}),
    ...(Array.isArray(value.out) ? { out: [...value.out] as string[] } : {}),
  };
}

export function cloneNodeContract(
  contract: GraphNodeContract | undefined,
): GraphNodeContract | undefined {
  if (!contract) {
    return undefined;
  }

  return {
    ...(contract.in ? { in: [...contract.in] } : {}),
    ...(contract.out ? { out: [...contract.out] } : {}),
  };
}

export function contractToGraphValue(contract: GraphNodeContract): GraphValue {
  return {
    ...(contract.in ? { in: [...contract.in] } : {}),
    ...(contract.out ? { out: [...contract.out] } : {}),
  };
}

export function printNodeCapture(node: NodeCaptureNode): string {
  switch (node.shape.type) {
    case "Identifier":
      return `<${node.shape.name}>`;
    case "StringLiteral":
      return `<${node.shape.raw}>`;
    case "NumberLiteral":
      return `<${node.shape.raw}>`;
    case "BooleanLiteral":
      return `<${node.shape.raw}>`;
    case "ObjectLiteral":
      return "<{...}>";
    case "TraversalExpr":
      return "<traversal>";
    default:
      return exhaustiveNever(node.shape);
  }
}

function exhaustiveNever(value: never): never {
  throw new Error(`Unhandled runtime node shape: ${JSON.stringify(value)}`);
}
