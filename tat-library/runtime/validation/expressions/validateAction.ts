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
import { validateIdentifier, ensureKnownAction } from "./shared.js";
import { validateActionExpression } from "./validateValue.js";
import { validateGraphQueryExpr } from "./validateQuery.js";
import { validateActionPipelineStep } from "./validateControl.js";

export function validateAction(action: ActionExprNode, state: ValidationState): void {
  if (!action.pipeline || action.pipeline.length === 0) {
    pushIssue(
      state,
      "error",
      action.span,
      "@action must define at least one pipeline step",
    );
  }

  if (action.guard) {
    validateActionGuard(action.guard, state);
  }

  if (action.project) {
    validateActionExpression(action.project, state);
  }

  for (const step of action.pipeline) {
    validateActionPipelineStep(step, state);
  }
}

export function validateActionGuard(
  expr: ActionGuardExprNode,
  state: ValidationState,
): void {
  if (expr.type === "GraphQueryExpr") {
    validateGraphQueryExpr(expr, state);
    return;
  }

  validateActionExpression(expr, state);
}

export function validateNodeCapture(
  statement: ValueBindingNode,
  state: ValidationState,
): void {
  const value = statement.value;

  if (value.type !== "NodeCapture") return;
  const shape = value.shape;

  if (shape.type === "ObjectLiteral") {
    validateNodeCaptureObjectLiteral(shape, state);
  }

  if (shape.type !== "TraversalExpr") return;

  for (const segment of shape.segments) {
    const operator =
      segment.type === "ActionSegment"
        ? segment.operator
        : segment.segment.operator;

    ensureKnownAction(state, operator.name, operator.span);
  }
}

export function validateNodeCaptureObjectLiteral(
  node: ObjectLiteralNode,
  state: ValidationState,
): void {
  const semanticIdProperty = node.properties.find(
    (property) => property.key === "semanticId",
  );
  if (semanticIdProperty && semanticIdProperty.value.type !== "StringLiteral") {
    pushIssue(
      state,
      "error",
      semanticIdProperty.value.span,
      "Node capture semanticId must be a string literal",
    );
  }

  const contractProperty = node.properties.find(
    (property) => property.key === "contract",
  );
  if (!contractProperty) {
    return;
  }

  if (contractProperty.value.type !== "ObjectLiteral") {
    pushIssue(
      state,
      "error",
      contractProperty.value.span,
      "Node capture contract must be an object literal",
    );
    return;
  }

  for (const property of contractProperty.value.properties) {
    if (property.key !== "in" && property.key !== "out") {
      pushIssue(
        state,
        "error",
        property.value.span,
        `Node capture contract only supports "in" and "out"`,
      );
      continue;
    }

    if (property.value.type !== "ArrayLiteral") {
      pushIssue(
        state,
        "error",
        property.value.span,
        `Node capture contract.${property.key} must be an array of strings`,
      );
      continue;
    }

    for (const element of property.value.elements) {
      if (element.type !== "StringLiteral") {
        pushIssue(
          state,
          "error",
          element.span,
          `Node capture contract.${property.key} entries must be string literals`,
        );
      }
    }
  }
}

