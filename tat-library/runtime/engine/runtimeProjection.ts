import type { ProgramNode } from "../../ast/nodeTypes.js";
import type { RuntimeProjectionOptions, RuntimeFocusRequest } from "./runtimeRequests.js";
import type { RuntimeState } from "./runtimeState.js";
import { executeTerminalGraphExpr, withResolvedProjectionFocus } from "../execute/projection/projectionExecution.js";

export function reprojectRuntimeState(
  program: ProgramNode,
  state: RuntimeState,
  options?: RuntimeProjectionOptions,
): Map<string, unknown> {
  const projections = new Map<string, unknown>();

  for (const statement of program.body) {
    if (statement.type === "GraphPipeline") {
      const graph = state.graphs.get(statement.name.name);
      if (!graph) {
        continue;
      }

      projections.set(
        statement.name.name,
        executeTerminalGraphExpr(
          statement.name.name,
          graph,
          withResolvedProjectionFocus(
            statement.name.name,
            statement.name.name,
            statement.projection,
            state,
            options,
          ),
          state,
        ),
      );
      continue;
    }

    if (statement.type === "GraphProjection") {
      const graph = state.graphs.get(statement.source.name);
      if (!graph) {
        continue;
      }

      projections.set(
        statement.name.name,
        executeTerminalGraphExpr(
          statement.name.name,
          graph,
          withResolvedProjectionFocus(
            statement.name.name,
            statement.source.name,
            statement.projection,
            state,
            options,
          ),
          state,
          statement.source.name,
        ),
      );
    }
  }

  return projections;
}

export function setRuntimeFocus(
  program: ProgramNode,
  state: RuntimeState,
  request: RuntimeFocusRequest,
): RuntimeState {
  const graph = state.graphs.get(request.graphBinding);
  if (!graph) {
    throw new Error(`Graph "${request.graphBinding}" is not available in runtime state`);
  }

  if (!graph.nodes.has(request.nodeId)) {
    throw new Error(
      `Focus node "${request.nodeId}" does not exist in graph "${request.graphBinding}"`,
    );
  }

  const graphFocus = new Map(state.graphFocus);
  graphFocus.set(request.graphBinding, request.nodeId);
  const nextState: RuntimeState = {
    ...state,
    graphFocus,
  };

  return {
    ...nextState,
    projections: reprojectRuntimeState(program, nextState),
  };
}

