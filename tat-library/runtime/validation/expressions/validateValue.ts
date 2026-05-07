import type {
  ActionExprNode,
  ActionGuardExprNode,
  ActionPipelineStepNode,
  AggregateQueryExprNode,
  ArrayLiteralNode,
  ComputeAbsExprNode,
  ComputeAvgExprNode,
  DeriveCollectExprNode,
  ComputeCountExprNode,
  ComputeEdgeCountExprNode,
  DeriveExprNode,
  ComputeExistsExprNode,
  ComputeMaxExprNode,
  DeriveMetaExprNode,
  ComputeMinExprNode,
  DerivePathExprNode,
  DeriveStateExprNode,
  ComputeSumExprNode,
  GraphControlExprNode,
  GraphPipelineStepNode,
  GraphInjectionStepNode,
  IdentifierNode,
  IfExprNode,
  RepeatCountExprNode,
  RepeatExprNode,
  MutationExprNode,
  ObjectLiteralNode,
  ValueBindingNode,
  WhenExprNode,
} from "../../../ast/nodeTypes.js";
import { pushIssue, type ValidationState } from "../validationState.js";
import { validateIdentifier } from "./shared.js";
import { validateGraphControlExpr } from "./validateControl.js";
import { validateDeriveStateExpr, validateDeriveMetaExpr, validateComputeCountExpr, validateComputeEdgeCountExpr, validateComputeExistsExpr, validateDerivePathExpr, validateDeriveCollectExpr, validateComputeSumExpr, validateComputeMinExpr, validateComputeMaxExpr, validateComputeAvgExpr, validateComputeAbsExpr, validateDeriveExpr } from "./validateDerive.js";

export function validateActionExpression(expr: any, state: ValidationState): void {
  if (!expr || typeof expr !== "object") return;

  switch (expr.type) {
    case "Identifier":
      validateIdentifier(expr.name, expr.span, state);
      return;

    case "PropertyAccess":
      validateIdentifier(expr.object.name, expr.object.span, state);
      return;

    case "BinaryBooleanExpr":
      validateActionExpression(expr.left, state);
      validateActionExpression(expr.right, state);
      return;

    case "UnaryBooleanExpr":
      validateActionExpression(expr.argument, state);
      return;

    case "ComparisonExpr":
      validateActionExpression(expr.left, state);
      validateActionExpression(expr.right, state);
      return;

    case "DeriveStateExpr":
      validateDeriveStateExpr(expr, state);
      return;

    case "DeriveMetaExpr":
      validateDeriveMetaExpr(expr, state);
      return;

    case "ComputeCountExpr":
      validateComputeCountExpr(expr, state);
      return;

    case "ComputeEdgeCountExpr":
      validateComputeEdgeCountExpr(expr, state);
      return;

    case "ComputeExistsExpr":
      validateComputeExistsExpr(expr, state);
      return;

    case "DerivePathExpr":
      validateDerivePathExpr(expr, state);
      return;

    case "DeriveCollectExpr":
      validateDeriveCollectExpr(expr, state);
      return;

    case "ComputeSumExpr":
      validateComputeSumExpr(expr, state);
      return;

    case "ComputeMinExpr":
      validateComputeMinExpr(expr, state);
      return;

    case "ComputeMaxExpr":
      validateComputeMaxExpr(expr, state);
      return;

    case "ComputeAvgExpr":
      validateComputeAvgExpr(expr, state);
      return;

    case "ComputeAbsExpr":
      validateComputeAbsExpr(expr, state);
      return;

    case "DeriveBinaryExpr":
      validateDeriveExpr(expr, state);
      return;

    case "ObjectLiteral":
      for (const prop of expr.properties) {
        validateActionExpression(prop.value, state);
      }
      return;

    case "ArrayLiteral":
      for (const el of expr.elements) {
        validateActionExpression(el, state);
      }
      return;

    default:
      return;
  }
}

export function validateProjectionExpression(expr: any, state: ValidationState): void {
  if (!expr || typeof expr !== "object") return;

  switch (expr.type) {
    case "Identifier":
      validateIdentifier(expr.name, expr.span, state);
      return;

    case "PropertyAccess":
      validateIdentifier(expr.object.name, expr.object.span, state);
      return;

    case "ChooseExpr":
      if (expr.when) {
        validateGraphControlExpr(expr.when, state, "@if when");
      }
      if (expr.then) {
        validateProjectionExpression(expr.then, state);
      }
      if (expr.else) {
        validateProjectionExpression(expr.else, state);
      }
      return;

    case "DirectiveCallExpr":
      for (const arg of expr.args) {
        validateProjectionExpression(arg.value, state);
      }
      return;

    case "ObjectLiteral":
      for (const prop of expr.properties) {
        validateProjectionExpression(prop.value, state);
      }
      return;

    case "ArrayLiteral":
      for (const element of expr.elements) {
        validateProjectionExpression(element, state);
      }
      return;

    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
    case "RuntimeGenerateNodeIdExpr":
    case "RuntimeGenerateValueIdExpr":
    case "RuntimeNextOrderExpr":
    case "NodeCapture":
      return;

    case "WhereExpr":
      validateGraphControlExpr(expr.expression, state, "@where");
      return;

    case "DeriveStateExpr":
      validateDeriveStateExpr(expr, state);
      return;

    case "DeriveMetaExpr":
      validateDeriveMetaExpr(expr, state);
      return;

    case "ComputeCountExpr":
      validateComputeCountExpr(expr, state);
      return;

    case "ComputeEdgeCountExpr":
      validateComputeEdgeCountExpr(expr, state);
      return;

    case "ComputeExistsExpr":
      validateComputeExistsExpr(expr, state);
      return;

    case "DerivePathExpr":
      validateDerivePathExpr(expr, state);
      return;

    case "DeriveCollectExpr":
      validateDeriveCollectExpr(expr, state);
      return;

    case "ComputeSumExpr":
      validateComputeSumExpr(expr, state);
      return;

    case "ComputeMinExpr":
      validateComputeMinExpr(expr, state);
      return;

    case "ComputeMaxExpr":
      validateComputeMaxExpr(expr, state);
      return;

    case "ComputeAvgExpr":
      validateComputeAvgExpr(expr, state);
      return;

    case "ComputeAbsExpr":
      validateComputeAbsExpr(expr, state);
      return;

    case "DeriveBinaryExpr":
      validateDeriveExpr(expr, state);
      return;

    default:
      return;
  }
}

