import type { GraphValue, GraphNodeContract } from "../../graph/graph.js";
import type { RuntimeProfiler } from "../../instrumentation/profiler.js";

export interface ActionScope {
  from: string;
  to?: string;
  payload?: Record<string, GraphValue>;
  node?: Record<string, GraphValue>;
}

export interface ActionExecutionResult {
  graph: import("../../graph/graph.js").Graph;
  didRun: boolean;
  project: GraphValue | null;
}

export interface ActionExecutionHooks {
  onGraphMutation?: () => void;
  causedBy?: string;
  profiler?: RuntimeProfiler;
}

export interface ExtractedRuntimeNodeValue {
  semanticId?: string;
  contract?: GraphNodeContract;
  value: GraphValue;
}
