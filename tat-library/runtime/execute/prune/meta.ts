import type { PruneMetaExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { removeNodeMeta } from "../../graph/graph.js";

export function executePruneMetaAction(
  step: PruneMetaExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  removeNodeMeta(
    context.graph,
    context.resolveScopedIdentifier(step.node.name),
    step.key.value,
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
