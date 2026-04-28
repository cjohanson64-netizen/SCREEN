import type { GraphControlExprNode } from "../../ast/nodeTypes.js";
import type { Graph } from "../graph.js";
import type { GraphControlOptions } from "./types.js";
import { applyComparisonOperator } from "./comparison.js";
import { evaluateGraphControlValue } from "./controlValue.js";
import { evaluateGraphQuery } from "./queryEvaluator.js";
import { exhaustiveNever, truthy } from "./utils.js";

export function evaluateGraphControlExpr(
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
      return truthy(evaluateGraphControlValue(graph, expr, options));

    default:
      return exhaustiveNever(expr);
  }
}

