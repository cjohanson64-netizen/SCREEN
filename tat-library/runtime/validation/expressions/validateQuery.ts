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
  GraphQueryExprNode,
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
import { validateActionExpression } from "./validateValue.js";

export function validateGraphQueryExpr(
  expr: GraphQueryExprNode,
  state: ValidationState,
): void {
  const usesEdgeMode =
    expr.subject !== null || expr.relation !== null || expr.object !== null;
  const usesStateMode = expr.state !== null;
  const usesMetaMode = expr.meta !== null;
  const modeCount =
    Number(usesEdgeMode) + Number(usesStateMode) + Number(usesMetaMode);

  if (modeCount !== 1) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@query must use exactly one mode: edge existence, state query, or meta query",
    );
  }

  if (usesEdgeMode) {
    if (!expr.subject || !expr.relation || !expr.object) {
      pushIssue(
        state,
        "error",
        expr.span,
        "@query edge existence requires subject, relation, and object",
      );
    }

    if (expr.equals) {
      pushIssue(
        state,
        "error",
        expr.equals.span,
        '@query edge existence does not support an "equals" field',
      );
    }

    if (expr.subject)
      validateIdentifier(expr.subject.name, expr.subject.span, state);
    if (expr.object)
      validateIdentifier(expr.object.name, expr.object.span, state);
  }

  if (usesStateMode || usesMetaMode) {
    if (!expr.node) {
      pushIssue(
        state,
        "error",
        expr.span,
        '@query state/meta mode requires a "node" field',
      );
    } else {
      validateIdentifier(expr.node.name, expr.node.span, state);
    }
  }

  if (usesStateMode) {
    if (!expr.state) {
      pushIssue(
        state,
        "error",
        expr.span,
        '@query state mode requires a "state" field',
      );
    }

    if (expr.meta) {
      pushIssue(
        state,
        "error",
        expr.span,
        '@query cannot combine "state" and "meta" fields',
      );
    }
  }

  if (usesMetaMode && !expr.meta) {
    pushIssue(
      state,
      "error",
      expr.span,
      '@query meta mode requires a "meta" field',
    );
  }

  if (expr.equals) {
    validateActionExpression(expr.equals, state);
  }
}

