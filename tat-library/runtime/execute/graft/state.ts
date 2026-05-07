import type { GraftStateExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { setNodeState } from "../../graph/graph.js";

export function executeGraftStateAction(
  step: GraftStateExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  setNodeState(
    context.graph,
    context.resolveScopedIdentifier(step.node.name),
    step.key.value,
    context.evaluateValue(step.value),
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
