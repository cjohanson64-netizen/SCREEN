import type { CtxClearExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { clearEdgeContext } from "../../graph/graph.js";

export function executeCtxClearAction(
  step: CtxClearExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  clearEdgeContext(
    context.graph,
    context.resolveScopedIdentifier(step.edge.name),
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
