import { evaluateGraphControlExpr } from "../../graphControl/controlEvaluator.js";
import type { Graph } from "../../graph/graph.js";
import type { RuntimeState, ReactiveCycleState } from "../../engine/runtimeState.js";

export function createReactiveCycleState(
  graph: Graph,
  state: RuntimeState,
): ReactiveCycleState {
  const triggerStates = new Map<string, boolean>();

  for (const trigger of state.whenTriggers) {
    triggerStates.set(
      trigger.id,
      evaluateGraphControlExpr(graph, trigger.query, {
        bindings: state.bindings,
        actions: state.actions,
      }),
    );
  }

  return {
    triggerStates,
    fireCount: 0,
  };
}

