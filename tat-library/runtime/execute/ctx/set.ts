import type { CtxSetExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { setEdgeContext } from "../../graph/graph.js";

export function executeCtxSetAction(
  step: CtxSetExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  setEdgeContext(
    context.graph,
    context.resolveScopedIdentifier(step.edge.name),
    context.evaluateValue(step.context),
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
