import type { GraphPipelineNode } from "../../../ast/nodeTypes.js";
import type { RuntimeState } from "../../engine/runtimeState.js";
import { executeTerminalGraphExpr, initializeGraphFocus } from "../projection/projectionExecution.js";
import { materializeGraphSource } from "./graphSourceExecution.js";
import { createReactiveCycleState } from "./reactiveCycle.js";
import { executeGraphPipelineStep } from "./graphPipelineStep.js";
import { measureTiming } from "../../instrumentation/timing.js";
export { executeWhenExpr } from "./whenExecution.js";
export { createReactiveCycleState } from "./reactiveCycle.js";
export { executeGraphPipelineStep, flushReactiveTriggers } from "./graphPipelineStep.js";

export function executeGraphPipeline(
  pipeline: GraphPipelineNode,
  state: RuntimeState,
): void {
  measureTiming(state.timing, "execute.graphPipeline", () => {
    const graph = materializeGraphSource(pipeline.source, state);
    const reactive = createReactiveCycleState(graph, state);

    for (const mutation of pipeline.mutations) {
      executeGraphPipelineStep(graph, mutation, state, reactive);
    }

    if (pipeline.projection) {
      initializeGraphFocus(
        state,
        pipeline.name.name,
        graph,
        pipeline.projection,
      );
      state.projections.set(
        pipeline.name.name,
        executeTerminalGraphExpr(
          pipeline.name.name,
          graph,
          pipeline.projection,
          state,
        ),
      );
      state.assetKinds.set(pipeline.name.name, "projection");
      state.terminalProjectReached = true;
      return;
    }

    state.graphs.set(pipeline.name.name, graph);
    state.assetKinds.set(pipeline.name.name, "graph");
    state.lastGraphName = pipeline.name.name;
  });
}
