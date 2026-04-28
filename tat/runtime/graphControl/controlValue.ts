import type { BooleanValueNode } from "../../ast/nodeTypes.js";
import type { Graph, GraphValue } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import { evaluateDeriveExpr } from "./deriveEvaluator.js";
import {
  resolveGraphControlIdentifier,
  resolveGraphControlPropertyAccess,
} from "./nodeResolution.js";
import { exhaustiveNever } from "./utils.js";

export function evaluateGraphControlValue(
  graph: Graph,
  value: BooleanValueNode,
  options?: GraphControlOptions,
): GraphValue {
  switch (value.type) {
    case "Identifier":
      return resolveGraphControlIdentifier(value.name, graph, options);

    case "PropertyAccess":
      return resolveGraphControlPropertyAccess(value, graph, options);

    case "StringLiteral":
      return value.value;

    case "NumberLiteral":
      return value.value;

    case "BooleanLiteral":
      return value.value;

    case "RegexLiteral":
      return value.raw;

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
      return evaluateDeriveExpr(graph, value, options);

    default:
      return exhaustiveNever(value);
  }
}

