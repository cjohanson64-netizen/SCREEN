import type { ActionPipelineStepNode } from "../../../ast/nodeTypes.js";
import { evaluateGraphControlExpr } from "../../graphControl/controlEvaluator.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";

export function executeIfAction(
  step: Extract<ActionPipelineStepNode, { type: "IfExpr" }>,
  context: ActionPipelineDirectiveContext,
): void {
  if (!step.when) {
    throw new Error("@if requires a condition");
  }

  if (!step.then.length) {
    throw new Error("@if requires a then pipeline");
  }

  const branch = evaluateGraphControlExpr(context.graph, step.when, {
    scope: context.scope,
  })
    ? step.then
    : step.else;

  if (!branch) {
    return;
  }

  context.executePipeline(branch);
}
