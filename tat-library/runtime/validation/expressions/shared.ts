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

export function validateIdentifier(
  name: string,
  span: any,
  state: ValidationState,
): void {
  if (name === "from" || name === "to" || name === "payload") {
    return;
  }

  if (
    state.nodeBindings.has(name) ||
    state.valueBindings.has(name) ||
    state.actionBindings.has(name)
  ) {
    return;
  }

  pushIssue(
    state,
    "warning",
    span,
    `Unknown identifier "${name}" inside @action`,
  );
}

export function ensureKnownAction(
  state: ValidationState,
  name: string,
  span?: { line: number; column: number },
): void {
  if (!state.actionBindings.has(name)) {
    pushIssue(
      state,
      "error",
      span,
      `Traversal operator "${name}" is not a declared action`,
    );
  }
}

