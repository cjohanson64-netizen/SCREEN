import type { LoopCountExprNode } from "../../ast/nodeTypes.js";
import type { Graph } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import {
  evaluateDeriveAbs,
  evaluateDeriveAvg,
  evaluateDeriveCount,
  evaluateDeriveEdgeCount,
  evaluateDeriveMax,
  evaluateDeriveMeta,
  evaluateDeriveMin,
  evaluateDeriveState,
  evaluateDeriveSum,
} from "./deriveEvaluator.js";

export function evaluateLoopCount(
  graph: Graph,
  countExpr: LoopCountExprNode,
  options?: GraphControlOptions,
): number {
  const value =
    countExpr.type === "NumberLiteral"
      ? countExpr.value
      : countExpr.type === "DeriveStateExpr"
        ? evaluateDeriveState(graph, countExpr, options)
        : countExpr.type === "DeriveMetaExpr"
          ? evaluateDeriveMeta(graph, countExpr, options)
          : countExpr.type === "DeriveEdgeCountExpr"
            ? evaluateDeriveEdgeCount(graph, countExpr, options)
            : countExpr.type === "DeriveSumExpr"
              ? evaluateDeriveSum(graph, countExpr, options)
              : countExpr.type === "DeriveMinExpr"
                ? evaluateDeriveMin(graph, countExpr, options)
                : countExpr.type === "DeriveMaxExpr"
                  ? evaluateDeriveMax(graph, countExpr, options)
                  : countExpr.type === "DeriveAvgExpr"
                    ? evaluateDeriveAvg(graph, countExpr, options)
                    : countExpr.type === "DeriveAbsExpr"
                      ? evaluateDeriveAbs(graph, countExpr, options)
                      : evaluateDeriveCount(graph, countExpr, options);

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("@loop count must resolve to a number");
  }

  if (!Number.isInteger(value)) {
    throw new Error("@loop count must resolve to a non-negative integer");
  }

  if (value < 0) {
    throw new Error("@loop count cannot be negative");
  }

  return value;
}

