import type { GraphControlExprNode } from "../../ast/nodeTypes.js";
import type { Graph } from "../graph/graph.js";
import type { GraphControlOptions } from "./types.js";
import { applyComparisonOperator } from "./comparison.js";
import { evaluateGraphControlValue } from "./controlValue.js";
import { evaluateGraphQuery } from "./queryEvaluator.js";
import { exhaustiveNever, truthy } from "./utils.js";
import { profileOperation } from "../instrumentation/profiler.js";

export function evaluateGraphControlExpr(
  graph: Graph,
  expr: GraphControlExprNode,
  options?: GraphControlOptions,
): boolean {
  return profileOperation(options?.profiler, graphControlOperationName(expr), () =>
    evaluateGraphControlExprUnprofiled(graph, expr, options),
  );
}

function evaluateGraphControlExprUnprofiled(
  graph: Graph,
  expr: GraphControlExprNode,
  options?: GraphControlOptions,
): boolean {
  if (expr.type === "GraphQueryExpr") {
    return evaluateGraphQuery(graph, expr, options);
  }

  switch (expr.type) {
    case "BinaryBooleanExpr":
      return expr.operator === "&&"
        ? evaluateGraphControlExpr(graph, expr.left, options) &&
            evaluateGraphControlExpr(graph, expr.right, options)
        : evaluateGraphControlExpr(graph, expr.left, options) ||
            evaluateGraphControlExpr(graph, expr.right, options);

    case "UnaryBooleanExpr":
      return !evaluateGraphControlExpr(graph, expr.argument, options);

    case "GroupedBooleanExpr":
      return evaluateGraphControlExpr(graph, expr.expression, options);

    case "ComparisonExpr": {
      const left = evaluateGraphControlValue(graph, expr.left, options);
      const right = evaluateGraphControlValue(graph, expr.right, options);
      return applyComparisonOperator(expr.operator, left, right);
    }

    case "Identifier":
    case "PropertyAccess":
    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
    case "RegexLiteral":
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
      return truthy(evaluateGraphControlValue(graph, expr, options));

    default:
      return exhaustiveNever(expr);
  }
}


function graphControlOperationName(expr: GraphControlExprNode): string {
  switch (expr.type) {
    case "GraphQueryExpr":
      return expr.name;
    case "ComparisonExpr":
      return "@where.comparison";
    case "BinaryBooleanExpr":
    case "UnaryBooleanExpr":
    case "GroupedBooleanExpr":
      return "@where.boolean";
    case "DeriveStateExpr":
      return "@derive.state";
    case "DeriveMetaExpr":
      return "@derive.meta";
    case "DerivePathExpr":
      return "@derive.path";
    case "DeriveCollectExpr":
      return "@derive.collect";
    case "ComputeCountExpr":
      return "@compute.count";
    case "ComputeEdgeCountExpr":
      return "@compute.edgeCount";
    case "ComputeExistsExpr":
      return "@compute.exists";
    case "ComputeSumExpr":
      return "@compute.sum";
    case "ComputeMinExpr":
      return "@compute.min";
    case "ComputeMaxExpr":
      return "@compute.max";
    case "ComputeAvgExpr":
      return "@compute.avg";
    case "ComputeAbsExpr":
      return "@compute.abs";
    case "Identifier":
    case "PropertyAccess":
    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
    case "RegexLiteral":
    case "DeriveBinaryExpr":
      return "@where.value";
  }
}
