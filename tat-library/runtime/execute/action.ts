import type { ActionPipelineStepNode } from "../../ast/nodeTypes.js";
import type { ActionRegistry, RuntimeAction } from "../engine/actionRegistry.js";

import { executeActionStep } from "./action/pipeline.js";
import type { ActionExecutionHooks, ActionExecutionResult, ActionScope } from "./action/types.js";
import { evaluateActionGuard, evaluateActionProjectExpr } from "./action/valueEvaluator.js";

export type { ActionExecutionHooks, ActionExecutionResult, ActionScope } from "./action/types.js";
export { evaluateActionGuard } from "./action/valueEvaluator.js";

export function executeAction(
  graph: ActionExecutionResult["graph"],
  action: RuntimeAction,
  scope: ActionScope,
  actions: ActionRegistry,
  hooks?: ActionExecutionHooks,
): ActionExecutionResult {
  if (action.guard) {
    const passes = evaluateActionGuard(action.guard, graph, scope);
    if (!passes) {
      return {
        graph,
        didRun: false,
        project: null,
      };
    }
  }

  for (const step of action.pipeline as ActionPipelineStepNode[]) {
    executeActionStep(graph, step, scope, actions, hooks);
  }

  const project = action.project
    ? evaluateActionProjectExpr(action.project, graph, scope)
    : null;

  return {
    graph,
    didRun: true,
    project,
  };
}
