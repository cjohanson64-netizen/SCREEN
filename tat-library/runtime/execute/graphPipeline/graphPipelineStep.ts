import type { ApplyExprNode, GraphInjectionStepNode, GraphPipelineStepNode, IfExprNode, RepeatExprNode, WhenExprNode } from "../../../ast/nodeTypes.js";
import {
  addBranch,
  addHistoryEntry,
  addNode,
  removeNode,
  cloneGraphValue,
  addProgress,
  clearEdgeContext,
  removeBranch,
  removeNodeMeta,
  removeNodeState,
  setEdgeContext,
  setNodeMeta,
  setNodeState,
  type Graph,
  type GraphValue,
} from "../../graph/graph.js";
import { executeAction } from "../../execute/action.js";
import { REACTIVE_TRIGGER_SAFETY_CAP } from "../../graphControl/constants.js";
import { evaluateGraphControlExpr } from "../../graphControl/controlEvaluator.js";
import { evaluateRepeatCount } from "../../graphControl/repeatEvaluator.js";
import { LOOP_SAFETY_CAP } from "../../graphControl/constants.js";
import { evaluateValueExpr } from "../../query/evaluateNodeCapture.js";
import { evaluateSemanticValue } from "../statements/bindingsExecution.js";
import type { RuntimeState, ReactiveCycleState } from "../../engine/runtimeState.js";
import { isRecordValue } from "../../engine/runtimeClone.js";
import { measureTiming } from "../../instrumentation/timing.js";
import { profileOperation } from "../../instrumentation/profiler.js";
import { executePruneNodesExpr, executePruneEdgesExpr } from "./pruneExecution.js";
import {
  recordInjectionHistory,
  resolveParseValidateGraphInjection,
} from "./injectionExecution.js";

export function executeGraphPipelineStep(
  graph: Graph,
  step: GraphPipelineStepNode,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  profileOperation(state.profiler, graphPipelineOperationName(step), () => {
    executeGraphPipelineStepUnprofiled(graph, step, state, reactive);
  });
}

function executeGraphPipelineStepUnprofiled(
  graph: Graph,
  step: GraphPipelineStepNode,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  if (step.type === "IfExpr") {
    executeGraphIfExpr(graph, step, state, reactive);
    return;
  }

  if (step.type === "WhenExpr") {
    executeInlineWhenExpr(graph, step, state, reactive);
    return;
  }

  if (step.type === "RepeatExpr") {
    executeGraphRepeatExpr(graph, step, state, reactive);
    return;
  }

  if (step.type === "GraphInjectionStep") {
    executeGraphInjectionStep(graph, step, state, reactive);
    return;
  }

  executeGraphMutationStep(graph, step, state, reactive);
}

function graphPipelineOperationName(step: GraphPipelineStepNode): string {
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
    case "GraphInjectionStep":
      return "@inject.graphPipeline";
  }
}

function executeGraphInjectionStep(
  graph: Graph,
  step: GraphInjectionStepNode,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  let payload = state.injections[step.inject.hookRef.name];

  try {
    const resolved = resolveParseValidateGraphInjection(step, state);
    payload = resolved.payload;

    measureTiming(state.timing, "inject.graphFlow.execute", () => {
      for (const injectedStep of resolved.steps) {
        executeGraphPipelineStep(graph, injectedStep, state, reactive);
      }
    });

    recordInjectionHistory(state, step.inject, resolved.payload, "graph-flow", "success", {
      executedStepCount: resolved.steps.length,
    });
  } catch (error) {
    if (payload) {
      recordInjectionHistory(state, step.inject, payload, "graph-flow", "error", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    throw error;
  }
}

function executeInlineWhenExpr(
  graph: Graph,
  step: WhenExprNode,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  if (!step.query) {
    throw new Error("@when requires a query");
  }

  if (!step.pipeline.length) {
    throw new Error("@when requires a pipeline");
  }

  const id = `when_${state.whenTriggers.length}`;
  const current = evaluateGraphControlExpr(graph, step.query, {
    bindings: state.bindings,
    actions: state.actions,
    profiler: state.profiler,
  });

  state.whenTriggers.push({
    id,
    query: step.query,
    pipeline: step.pipeline,
  });

  reactive.triggerStates.set(id, current);
}

function executeGraphIfExpr(
  graph: Graph,
  step: IfExprNode,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  if (!step.when) {
    throw new Error("@if requires a when clause");
  }

  if (!step.then.length) {
    throw new Error("@if requires a then pipeline");
  }

  const branch = evaluateGraphControlExpr(graph, step.when, {
    bindings: state.bindings,
    actions: state.actions,
    profiler: state.profiler,
  })
    ? step.then
    : step.else;

  if (!branch) {
    return;
  }

  for (const branchStep of branch) {
    executeGraphPipelineStep(graph, branchStep, state, reactive);
  }
}

function executeGraphRepeatExpr(
  graph: Graph,
  step: RepeatExprNode,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  if (!step.pipeline.length) {
    throw new Error("@repeat requires a pipeline section");
  }

  if (!step.count) {
    throw new Error("@repeat requires an iteration count");
  }

  const count = evaluateRepeatCount(graph, step.count, {
    bindings: state.bindings,
    actions: state.actions,
  });

  for (let iteration = 0; iteration < count; iteration += 1) {
    if (iteration >= LOOP_SAFETY_CAP) {
      throw new Error(`@repeat exceeded safety cap of ${LOOP_SAFETY_CAP} iterations`);
    }

    for (const repeatStep of step.pipeline) {
      executeGraphPipelineStep(graph, repeatStep, state, reactive);
    }
  }
}

function executeGraphMutationStep(
  graph: Graph,
  mutation: Exclude<GraphPipelineStepNode, IfExprNode | WhenExprNode | RepeatExprNode | GraphInjectionStepNode>,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  switch (mutation.type) {
    case "GraftBranchExpr":
      {
      const metadata = mutation.metadata
        ? evaluateValueExpr(mutation.metadata, state.bindings, state.actions)
        : null;
      if (metadata !== null && (typeof metadata !== "object" || Array.isArray(metadata))) {
        throw new Error("@graft.branch metadata must evaluate to an object");
      }
      addBranch(
        graph,
        mutation.subject.name,
        mutation.relation.value,
        mutation.object.name,
        {
          metadata: (metadata ?? undefined) as Record<string, GraphValue> | undefined,
        },
      );
      flushReactiveTriggers(graph, state, reactive);
      return;
      }

    case "GraftStateExpr": {
      const value = evaluateSemanticValue(mutation.value, state, graph);
      setNodeState(graph, mutation.node.name, mutation.key.value, value);
      flushReactiveTriggers(graph, state, reactive);
      return;
    }

    case "GraftMetaExpr": {
      const value = evaluateSemanticValue(mutation.value, state, graph);
      setNodeMeta(graph, mutation.node.name, mutation.key.value, value);
      flushReactiveTriggers(graph, state, reactive);
      return;
    }

    case "GraftProgressExpr":
      addProgress(
        graph,
        mutation.from.name,
        mutation.relation.value,
        mutation.to.name,
      );
      flushReactiveTriggers(graph, state, reactive);
      return;

    case "PruneBranchExpr":
      {
      const metadata = mutation.metadata
        ? evaluateValueExpr(mutation.metadata, state.bindings, state.actions)
        : null;
      if (metadata !== null && (typeof metadata !== "object" || Array.isArray(metadata))) {
        throw new Error("@prune.branch metadata must evaluate to an object");
      }
      removeBranch(
        graph,
        mutation.subject.name,
        mutation.relation.value,
        mutation.object.name,
        {
          metadata: (metadata ?? undefined) as Record<string, GraphValue> | undefined,
        },
      );
      flushReactiveTriggers(graph, state, reactive);
      return;
      }

    case "PruneStateExpr":
      removeNodeState(graph, mutation.node.name, mutation.key.value);
      flushReactiveTriggers(graph, state, reactive);
      return;

    case "PruneMetaExpr":
      removeNodeMeta(graph, mutation.node.name, mutation.key.value);
      flushReactiveTriggers(graph, state, reactive);
      return;

    case "PruneNodesExpr":
      executePruneNodesExpr(graph, mutation, state);
      flushReactiveTriggers(graph, state, reactive);
      return;

    case "PruneEdgesExpr":
      executePruneEdgesExpr(graph, mutation, state);
      flushReactiveTriggers(graph, state, reactive);
      return;

    case "RuntimeAddNodeExpr": {
      const nodeId = mutation.node.type === "Identifier"
        ? mutation.node.name
        : String(evaluateSemanticValue(mutation.node as any, state, graph));
      const existing = state.bindings.nodes.get(nodeId);
      const value = evaluateSemanticValue(mutation.value, state, graph);
      const stateValue = evaluateSemanticValue(mutation.state, state, graph);
      const metaValue = evaluateSemanticValue(mutation.meta, state, graph);
      if (!isRecordValue(stateValue)) throw new Error("@runtime.addNode state must evaluate to an object");
      if (!isRecordValue(metaValue)) throw new Error("@runtime.addNode meta must evaluate to an object");
      addNode(graph, {
        id: nodeId,
        semanticId: existing?.semanticId,
        contract: existing?.contract,
        value,
        state: stateValue,
        meta: metaValue,
      });
      addHistoryEntry(graph, {
        op: "@runtime.addNode",
        payload: { nodeId, value: cloneGraphValue(value), state: cloneGraphValue(stateValue), meta: cloneGraphValue(metaValue) },
      });
      flushReactiveTriggers(graph, state, reactive);
      return;
    }

    case "RuntimeUpdateNodeValueExpr": {
      const nodeId = mutation.node.name;
      const patch = evaluateSemanticValue(mutation.patch, state, graph);
      if (!isRecordValue(patch)) throw new Error("@runtime.updateNodeValue patch must evaluate to an object");
      const node = graph.nodes.get(nodeId);
      if (!node) throw new Error(`Graph node "${nodeId}" does not exist`);
      if (!isRecordValue(node.value)) throw new Error(`Graph node "${nodeId}" does not have an object value to update`);
      node.value = { ...node.value, ...patch };
      addHistoryEntry(graph, { op: "@runtime.updateNodeValue", payload: { nodeId, patch: cloneGraphValue(patch) } });
      flushReactiveTriggers(graph, state, reactive);
      return;
    }

    case "RuntimeDeleteNodeExpr": {
      removeNode(graph, mutation.node.name);
      addHistoryEntry(graph, { op: "@runtime.deleteNode", payload: { nodeId: mutation.node.name } });
      flushReactiveTriggers(graph, state, reactive);
      return;
    }

    case "CtxSetExpr": {
      const context = evaluateSemanticValue(mutation.context, state, graph);
      setEdgeContext(graph, mutation.edge.name, context);
      flushReactiveTriggers(graph, state, reactive);
      return;
    }

    case "CtxClearExpr":
      clearEdgeContext(graph, mutation.edge.name);
      flushReactiveTriggers(graph, state, reactive);
      return;

    case "ApplyExpr":
      executeApplyExpr(graph, mutation, state, reactive);
      return;

    default: {
      throw new Error(
        `Unsupported mutation type: ${JSON.stringify(mutation)}`,
      );
    }
  }
}

export function flushReactiveTriggers(
  graph: Graph,
  state: RuntimeState,
  reactive: ReactiveCycleState,
): void {
  if (state.whenTriggers.length === 0) {
    return;
  }

  while (true) {
    let fired = false;

    for (const trigger of state.whenTriggers) {
      const current = evaluateGraphControlExpr(graph, trigger.query, {
        bindings: state.bindings,
        actions: state.actions,
        profiler: state.profiler,
      });
      const previous = reactive.triggerStates.get(trigger.id) ?? false;

      if (!current) {
        reactive.triggerStates.set(trigger.id, false);
        continue;
      }

      if (previous) {
        continue;
      }

      reactive.triggerStates.set(trigger.id, true);
      reactive.fireCount += 1;

      if (reactive.fireCount > REACTIVE_TRIGGER_SAFETY_CAP) {
        throw new Error(
          `@when exceeded reactive safety cap of ${REACTIVE_TRIGGER_SAFETY_CAP} firings in a single execution cycle`,
        );
      }

      for (const step of trigger.pipeline) {
        executeGraphPipelineStep(graph, step, state, reactive);
      }

      fired = true;
      break;
    }

    if (!fired) {
      return;
    }
  }
}

function executeApplyExpr(
  graph: Graph,
  mutation: ApplyExprNode,
  state: RuntimeState,
  reactive?: ReactiveCycleState,
): void {
  const actionName = mutation.target.type === "Identifier" ? mutation.target.name : "";
  const action = state.actions.get(actionName);

  if (!action) {
    throw new Error(`@action.apply could not find action "${actionName}"`);
  }

  const applyEvent = addHistoryEntry(graph, {
    op: "@action.apply",
    payload: {
      action: actionName,
      from: graph.root ?? "",
    },
  });

  executeAction(
    graph,
    action,
    { from: graph.root ?? "" },
    state.actions,
    reactive
      ? {
          causedBy: applyEvent.id,
          profiler: state.profiler,
          onGraphMutation: () => flushReactiveTriggers(graph, state, reactive),
        }
      : { causedBy: applyEvent.id, profiler: state.profiler },
  );
}
