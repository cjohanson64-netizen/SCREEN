import type { GraftProgressExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { addProgress } from "../../graph/graph.js";

export function executeGraftProgressAction(
  step: GraftProgressExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  addProgress(
    context.graph,
    context.resolveScopedIdentifier(step.from.name),
    step.relation.value,
    context.resolveScopedIdentifier(step.to.name),
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
