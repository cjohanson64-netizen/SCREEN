import type { PruneStateExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { removeNodeState } from "../../graph/graph.js";

export function executePruneStateAction(
  step: PruneStateExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  removeNodeState(
    context.graph,
    context.resolveScopedIdentifier(step.node.name),
    step.key.value,
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
