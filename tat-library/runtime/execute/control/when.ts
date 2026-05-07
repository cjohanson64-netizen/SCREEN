import type { ActionPipelineStepNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";

export function executeWhenAction(
  _step: Extract<ActionPipelineStepNode, { type: "WhenExpr" }>,
  _context: ActionPipelineDirectiveContext,
): void {
  throw new Error("@when is not supported inside @action pipelines");
}
