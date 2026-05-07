import type { RepeatCountExprNode } from "../../ast/nodeTypes.js";
import type { Graph } from "../graph/graph.js";
import type { GraphControlOptions } from "./types.js";
import {
  evaluateComputeAbs,
  evaluateComputeAvg,
  evaluateComputeCount,
  evaluateComputeEdgeCount,
  evaluateComputeMax,
  evaluateDeriveMeta,
  evaluateComputeMin,
  evaluateDeriveState,
  evaluateComputeSum,
} from "./deriveEvaluator.js";

export function evaluateRepeatCount(
  graph: Graph,
  countExpr: RepeatCountExprNode,
  options?: GraphControlOptions,
): number {
  const value =
    countExpr.type === "NumberLiteral"
      ? countExpr.value
      : countExpr.type === "DeriveStateExpr"
        ? evaluateDeriveState(graph, countExpr, options)
        : countExpr.type === "DeriveMetaExpr"
          ? evaluateDeriveMeta(graph, countExpr, options)
          : countExpr.type === "ComputeEdgeCountExpr"
            ? evaluateComputeEdgeCount(graph, countExpr, options)
            : countExpr.type === "ComputeSumExpr"
              ? evaluateComputeSum(graph, countExpr, options)
              : countExpr.type === "ComputeMinExpr"
                ? evaluateComputeMin(graph, countExpr, options)
                : countExpr.type === "ComputeMaxExpr"
                  ? evaluateComputeMax(graph, countExpr, options)
                  : countExpr.type === "ComputeAvgExpr"
                    ? evaluateComputeAvg(graph, countExpr, options)
                    : countExpr.type === "ComputeAbsExpr"
                      ? evaluateComputeAbs(graph, countExpr, options)
                      : evaluateComputeCount(graph, countExpr, options);

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("@repeat count must resolve to a number");
  }

  if (!Number.isInteger(value)) {
    throw new Error("@repeat count must resolve to a non-negative integer");
  }

  if (value < 0) {
    throw new Error("@repeat count cannot be negative");
  }

  return value;
}

