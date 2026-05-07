import type { ActionPipelineStepNode } from "../../../ast/nodeTypes.js";
import type { ActionRegistry } from "../../engine/actionRegistry.js";
import type { Graph } from "../../graph/graph.js";

import { executeRuntimeAddNodeAction } from "../runtime/addNode.js";
import { executeRuntimeUpdateNodeValueAction } from "../runtime/updateNodeValue.js";
import { executeRuntimeDeleteNodeAction } from "../runtime/deleteNode.js";
import { executeGraftBranchAction } from "../graft/branch.js";
import { executeGraftStateAction } from "../graft/state.js";
import { executeGraftMetaAction } from "../graft/meta.js";
import { executeGraftProgressAction } from "../graft/progress.js";
import { executePruneBranchAction } from "../prune/branch.js";
import { executePruneStateAction } from "../prune/state.js";
import { executePruneMetaAction } from "../prune/meta.js";
import { executeCtxSetAction } from "../ctx/set.js";
import { executeCtxClearAction } from "../ctx/clear.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { executeRepeatAction } from "../control/repeat.js";
import { executeIfAction } from "../control/if.js";
import { executeWhenAction } from "../control/when.js";
import { executeApplyAction } from "./applyAction.js";
import type { ActionExecutionHooks, ActionScope } from "./types.js";
import { profileOperation } from "../../instrumentation/profiler.js";
import {
  cloneNodeContract,
  contractToGraphValue,
  evaluateActionProjectExpr,
  extractRuntimeNodeValue,
  isRecord,
  resolveRuntimeAddNodeTarget,
  resolveScopedIdentifier,
} from "./valueEvaluator.js";

export function executeActionStep(
  graph: Graph,
  step: ActionPipelineStepNode,
  scope: ActionScope,
  actions: ActionRegistry,
  hooks?: ActionExecutionHooks,
): void {
  profileOperation(hooks?.profiler, actionPipelineOperationName(step), () => {
    executeActionStepUnprofiled(graph, step, scope, actions, hooks);
  });
}

function executeActionStepUnprofiled(
  graph: Graph,
  step: ActionPipelineStepNode,
  scope: ActionScope,
  actions: ActionRegistry,
  hooks?: ActionExecutionHooks,
): void {
  const context: ActionPipelineDirectiveContext = {
    graph,
    scope,
    actions,
    hooks,
    executeStep: (nextStep) => executeActionStep(graph, nextStep, scope, actions, hooks),
    executePipeline: (pipeline) => {
      for (const nextStep of pipeline) {
        executeActionStep(graph, nextStep, scope, actions, hooks);
      }
    },
    evaluateValue: (expr) => evaluateActionProjectExpr(expr, graph, scope),
    resolveScopedIdentifier: (name) => resolveScopedIdentifier(name, scope),
    resolveRuntimeAddNodeTarget: (node) => resolveRuntimeAddNodeTarget(graph, node, scope),
    extractRuntimeNodeValue,
    cloneNodeContract,
    contractToGraphValue,
    isRecord,
    markMutation: () => hooks?.onGraphMutation?.(),
  };

  if (step.type === "RepeatExpr") {
    executeRepeatAction(step, context);
    return;
  }

  if (step.type === "IfExpr") {
    executeIfAction(step, context);
    return;
  }

  if (step.type === "WhenExpr") {
    executeWhenAction(step, context);
    return;
  }

  switch (step.type) {
    case "RuntimeAddNodeExpr":
      executeRuntimeAddNodeAction(step, context);
      return;

    case "RuntimeUpdateNodeValueExpr":
      executeRuntimeUpdateNodeValueAction(step, context);
      return;

    case "RuntimeDeleteNodeExpr":
      executeRuntimeDeleteNodeAction(step, context);
      return;

    case "GraftBranchExpr":
      executeGraftBranchAction(step, context);
      return;

    case "GraftStateExpr":
      executeGraftStateAction(step, context);
      return;

    case "GraftMetaExpr":
      executeGraftMetaAction(step, context);
      return;

    case "GraftProgressExpr":
      executeGraftProgressAction(step, context);
      return;

    case "PruneBranchExpr":
      executePruneBranchAction(step, context);
      return;

    case "PruneStateExpr":
      executePruneStateAction(step, context);
      return;

    case "PruneMetaExpr":
      executePruneMetaAction(step, context);
      return;

    case "CtxSetExpr":
      executeCtxSetAction(step, context);
      return;

    case "CtxClearExpr":
      executeCtxClearAction(step, context);
      return;

    case "ApplyExpr":
      executeApplyAction(step, context);
      return;

    case "PruneNodesExpr":
    case "PruneEdgesExpr":
      throw new Error(`${step.name} is not supported inside @action pipelines`);
  }
}


function actionPipelineOperationName(step: ActionPipelineStepNode): string {
  switch (step.type) {
    case "GraftBranchExpr":
      return "@graft.branch";
    case "GraftStateExpr":
      return "@graft.state";
    case "GraftMetaExpr":
      return "@graft.meta";
    case "GraftProgressExpr":
      return "@graft.progress";
    case "PruneBranchExpr":
      return "@prune.branch";
    case "PruneStateExpr":
      return "@prune.state";
    case "PruneMetaExpr":
      return "@prune.meta";
    case "PruneNodesExpr":
      return "@prune.nodes";
    case "PruneEdgesExpr":
      return "@prune.edges";
    case "RuntimeAddNodeExpr":
      return "@runtime.addNode";
    case "RuntimeUpdateNodeValueExpr":
      return "@runtime.updateNodeValue";
    case "RuntimeDeleteNodeExpr":
      return "@runtime.deleteNode";
    case "CtxSetExpr":
      return "@ctx.set";
    case "CtxClearExpr":
      return "@ctx.clear";
    case "ApplyExpr":
      return "@action.apply";
    case "IfExpr":
      return "@if";
    case "WhenExpr":
      return "@when";
    case "RepeatExpr":
      return "@repeat";
  }

  return "@unknown"
}
