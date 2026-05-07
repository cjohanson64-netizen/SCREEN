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
import { validateMutation, isMutationExpr } from "./validateMutation.js";
import { validateActionExpression } from "./validateValue.js";
import { validateGraphQueryExpr } from "./validateQuery.js";
import { validateDeriveStateExpr, validateDeriveMetaExpr, validateComputeEdgeCountExpr, validateDeriveExpr } from "./validateDerive.js";

export function validateWhenExpr(
  statement: WhenExprNode,
  state: ValidationState,
): void {
  if (!statement.query) {
    pushIssue(state, "error", statement.span, "@when requires a query");
  } else {
    validateGraphControlExpr(statement.query, state, "@when query");
  }

  if (!statement.pipeline.length) {
    pushIssue(state, "error", statement.span, "@when requires a pipeline");
  }

  for (const step of statement.pipeline) {
    validateGraphPipelineStep(step, state);
  }
}

export function validateGraphInjectionStep(
  step: GraphInjectionStepNode,
  state: ValidationState,
): void {
  if (!step.inject.hookRef.name) {
    pushIssue(state, "error", step.span, "@inject requires a hookRef identifier");
  }

  if (!step.inject.fileExtension.value) {
    pushIssue(state, "error", step.span, "@inject requires a file extension");
  }

  if (step.inject.alias) {
    pushIssue(state, "error", step.inject.alias.span, "Injection aliases are only supported for top-level @inject in V1.");
  }
}

export function validateGraphPipelineStep(
  step: GraphPipelineStepNode,
  state: ValidationState,
): void {
  if (step.type === "IfExpr") {
    validateIfExpr(step, state);
    return;
  }

  if (step.type === "WhenExpr") {
    validateWhenExpr(step, state);
    return;
  }

  if (step.type === "RepeatExpr") {
    validateRepeatExpr(step, state);
    return;
  }

  if (step.type === "GraphInjectionStep") {
    validateGraphInjectionStep(step, state);
    return;
  }

  if (isMutationExpr(step)) {
    validateMutation(step, state);
  }
}

export function validateActionPipelineStep(
  step: ActionPipelineStepNode,
  state: ValidationState,
): void {
  if (step.type === "RepeatExpr") {
    validateRepeatExpr(step, state);
    return;
  }

  if (step.type === "WhenExpr") {
    pushIssue(
      state,
      "error",
      step.span,
      "@when is not supported inside @action pipelines",
    );
    return;
  }

  if (step.type === "IfExpr") {
    validateIfExpr(step, state);
    return;
  }

  if (step.type === "GraphInjectionStep") {
    pushIssue(
      state,
      "error",
      step.span,
      "@inject is not supported inside @action pipelines",
    );
    return;
  }

  if (isMutationExpr(step)) {
    validateMutation(step, state);
  }
}

export function validateIfExpr(expr: IfExprNode, state: ValidationState): void {
  if (!expr.when) {
    pushIssue(state, "error", expr.span, "@if requires a when clause");
  } else {
    validateGraphControlExpr(expr.when, state, "@if when");
  }

  if (!expr.then.length) {
    pushIssue(state, "error", expr.span, "@if requires a then pipeline");
  }

  for (const step of expr.then) {
    validateGraphPipelineStep(step, state);
  }

  for (const step of expr.else ?? []) {
    validateGraphPipelineStep(step, state);
  }
}

export function validateRepeatExpr(repeat: RepeatExprNode, state: ValidationState): void {
  if (!repeat.pipeline.length) {
    pushIssue(state, "error", repeat.span, "@repeat requires a pipeline section");
  }

  if (!repeat.count) {
    pushIssue(state, "error", repeat.span, "@repeat requires an iteration count");
  } else {
    validateRepeatCountExpr(repeat.count, state);
  }

  for (const step of repeat.pipeline) {
    validateActionPipelineStep(step, state);
  }
}

export function validateRepeatCountExpr(
  expr: RepeatCountExprNode,
  state: ValidationState,
): void {
  if (expr.type === "NumberLiteral") {
    if (!Number.isInteger(expr.value)) {
      pushIssue(state, "error", expr.span, "@repeat count must be an integer");
    }

    if (expr.value < 0) {
      pushIssue(state, "error", expr.span, "@repeat count cannot be negative");
    }
    return;
  }

  if (expr.type === "DeriveStateExpr") {
    validateDeriveStateExpr(expr, state);
    return;
  }

  if (expr.type === "DeriveMetaExpr") {
    validateDeriveMetaExpr(expr, state);
    return;
  }

  if (expr.type === "ComputeEdgeCountExpr") {
    validateComputeEdgeCountExpr(expr, state);
    return;
  }

  validateDeriveExpr(expr, state);
}

export function validateGraphControlExpr(
  expr: GraphControlExprNode,
  state: ValidationState,
  _label: string,
): void {
  if (expr.type === "GraphQueryExpr") {
    validateGraphQueryExpr(expr, state);
    return;
  }

  validateActionExpression(expr, state);
}

