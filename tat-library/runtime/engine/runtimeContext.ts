import type { GraphWorkspace } from "../graph/executeGraphInteraction.js";
import type { Graph } from "../graph/graph.js";
import type { RuntimeState } from "./runtimeState.js";

export function createQueryWorkspace(state: RuntimeState): GraphWorkspace {
  const graphs = new Map(state.graphs);

  if (state.seedGraph && !graphs.has("seed")) {
    graphs.set("seed", state.seedGraph);
  }

  return {
    graphs,
    interactionHistory: state.interactionHistory,
  };
}

export function getCurrentGraph(state: RuntimeState): Graph | null {
  if (state.lastGraphName) {
    return state.graphs.get(state.lastGraphName) ?? null;
  }

  return state.seedGraph;
}

export function ensureProjectNotTerminal(state: RuntimeState, opName: string): void {
  if (state.terminalProjectReached) {
    throw new Error(`${opName} cannot execute after terminal @project.apply(...)`);
  }
}

export function requireCurrentGraph(state: RuntimeState, opName: string): Graph {
  const graph = getCurrentGraph(state);

  if (!graph) {
    throw new Error(
      `${opName} requires an active graph from @seed or a graph pipeline`,
    );
  }

  return graph;
}

