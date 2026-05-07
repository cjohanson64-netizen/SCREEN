import type { ActionPipelineStepNode, ProgramNode } from "../../ast/nodeTypes.js";
import { addHistoryEntry, cloneGraph, type Graph, type GraphValue } from "../graph/graph.js";
import { executeAction } from "../execute/action.js";
import type { RuntimeAction } from "./actionRegistry.js";
import type { RuntimeApplyActionRequest, RuntimeProjectionOptions } from "./runtimeRequests.js";
import type { RuntimeState } from "./runtimeState.js";
import { createReactiveCycleState, flushReactiveTriggers } from "../execute/graphPipeline/graphPipelineExecution.js";
import { reprojectRuntimeState } from "./runtimeProjection.js";

export function applyRuntimeAction(
  program: ProgramNode,
  state: RuntimeState,
  request: RuntimeApplyActionRequest,
  options?: RuntimeProjectionOptions,
): RuntimeState {
  const originalGraph = state.graphs.get(request.graphBinding);
  if (!originalGraph) {
    throw new Error(`Graph "${request.graphBinding}" is not available in runtime state`);
  }

  const graph = cloneGraph(originalGraph);
  const result = applyRuntimeActionToGraph(graph, state, request);

  if (!result.didRun) {
    return state;
  }

  const graphs = new Map(state.graphs);
  graphs.set(request.graphBinding, graph);
  const nextState: RuntimeState = {
    ...state,
    graphs,
  };

  return {
    ...nextState,
    projections: reprojectRuntimeState(program, nextState, options),
  };
}

export function applyRuntimeActionToGraph(
  graph: Graph,
  state: RuntimeState,
  request: RuntimeApplyActionRequest,
  options?: { causedBy?: string },
): { didRun: boolean } {
  const actionName = request.action ?? request.hook;
  if (!actionName) {
    throw new Error("Runtime action request requires an action or hook");
  }
  const action = state.actions.get(actionName);
  if (!action) {
    throw new Error(`@action.apply could not find action "${actionName}"`);
  }

  const resolvedTarget = resolveRuntimeActionTarget(graph, action, request);

  const reactive = createReactiveCycleState(graph, state);
  const applyEvent = addHistoryEntry(
    graph,
    {
      op: "@action.apply",
      payload: {
        from: request.from,
        action: actionName,
        hook: request.hook ?? actionName,
        to: resolvedTarget ?? null,
      },
    },
    { causedBy: options?.causedBy },
  );

  const result = executeAction(
    graph,
    action,
    {
      from: request.from,
      to: resolvedTarget,
      payload: request.payload,
    },
    state.actions,
    {
      causedBy: applyEvent.id,
      onGraphMutation: () => flushReactiveTriggers(graph, state, reactive),
    },
  );

  if (!result.didRun) {
    graph.history = graph.history.filter((entry) => entry.id !== applyEvent.id);
  }

  return { didRun: result.didRun };
}

function resolveRuntimeActionTarget(
  graph: Graph,
  action: RuntimeAction,
  request: RuntimeApplyActionRequest,
): string | undefined {
  if (request.to) {
    return request.to;
  }

  if (request.target) {
    return request.target;
  }

  const generatedTargetExpr = findGeneratedNodeIdExpr(action.pipeline);
  if (!generatedTargetExpr) {
    return undefined;
  }

  return generateRuntimeNodeIdForAction(graph, generatedTargetExpr.prefix?.value ?? null);
}

function findGeneratedNodeIdExpr(
  steps: ActionPipelineStepNode[],
): { prefix: { value: string } | null } | null {
  for (const step of steps) {
    if (step.type === "RuntimeAddNodeExpr" && step.node.type === "RuntimeGenerateNodeIdExpr") {
      return step.node;
    }

    if (step.type === "IfExpr") {
      const thenMatch = findGeneratedNodeIdExpr(step.then);
      if (thenMatch) return thenMatch;

      const elseMatch = step.else ? findGeneratedNodeIdExpr(step.else) : null;
      if (elseMatch) return elseMatch;
    }

    if (step.type === "RepeatExpr") {
      const loopMatch = findGeneratedNodeIdExpr(step.pipeline);
      if (loopMatch) return loopMatch;
    }
  }

  return null;
}

function generateRuntimeNodeIdForAction(
  graph: Graph,
  prefix: string | null,
): string {
  const normalizedPrefix = prefix?.trim() || "node";
  const counter = graph.history.length + 1;
  return `${normalizedPrefix}Node_${counter}`;
}

