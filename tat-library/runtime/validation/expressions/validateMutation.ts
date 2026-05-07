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
import { validateActionExpression } from "./validateValue.js";

export function validateMutation(
  mutation: MutationExprNode,
  state: ValidationState,
): void {
  switch (mutation.type) {
    case "RuntimeAddNodeExpr":
      validateIdentifier(mutation.node.name, mutation.node.span, state);
      validateActionExpression(mutation.value, state);
      validateActionExpression(mutation.state, state);
      validateActionExpression(mutation.meta, state);
      return;

    case "RuntimeUpdateNodeValueExpr":
      validateIdentifier(mutation.node.name, mutation.node.span, state);
      validateActionExpression(mutation.patch, state);
      return;

    case "RuntimeDeleteNodeExpr":
      validateIdentifier(mutation.node.name, mutation.node.span, state);
      return;

    case "GraftBranchExpr":
    case "PruneBranchExpr":
      validateIdentifier(mutation.subject.name, mutation.subject.span, state);
      validateIdentifier(mutation.object.name, mutation.object.span, state);
      return;

    case "GraftProgressExpr":
      validateIdentifier(mutation.from.name, mutation.from.span, state);
      validateIdentifier(mutation.to.name, mutation.to.span, state);
      return;

    case "GraftStateExpr":
    case "GraftMetaExpr":
    case "PruneStateExpr":
    case "PruneMetaExpr":
      validateIdentifier(mutation.node.name, mutation.node.span, state);
      return;

    case "PruneNodesExpr":
    case "PruneEdgesExpr":
      return;

    default:
      return;
  }
}

export function isMutationExpr(
  step: GraphPipelineStepNode | ActionPipelineStepNode,
): step is MutationExprNode {
  switch (step.type) {
    case "RuntimeAddNodeExpr":
    case "RuntimeUpdateNodeValueExpr":
    case "RuntimeDeleteNodeExpr":
    case "GraftBranchExpr":
    case "GraftStateExpr":
    case "GraftMetaExpr":
    case "GraftProgressExpr":
    case "PruneBranchExpr":
    case "PruneStateExpr":
    case "PruneMetaExpr":
    case "PruneNodesExpr":
    case "PruneEdgesExpr":
    case "ApplyExpr":
      return true;
    default:
      return false;
  }
}

