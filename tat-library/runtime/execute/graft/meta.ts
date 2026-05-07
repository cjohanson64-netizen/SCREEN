import type { GraftMetaExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { setNodeMeta } from "../../graph/graph.js";

export function executeGraftMetaAction(
  step: GraftMetaExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  setNodeMeta(
    context.graph,
    context.resolveScopedIdentifier(step.node.name),
    step.key.value,
    context.evaluateValue(step.value),
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
