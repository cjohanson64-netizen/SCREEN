import type { GraphValue } from "../graph/graph.js";

export interface RuntimeApplyActionRequest {
  graphBinding: string;
  from: string;
  action?: string;
  hook?: string;
  to?: string;
  target?: string;
  payload?: Record<string, GraphValue>;
}

export interface RuntimeFocusRequest {
  graphBinding: string;
  nodeId: string;
}

export interface RuntimeProjectionOptions {
  // Deprecated compatibility path for tooling/tests that still need to force
  // projection focus externally. Runtime-owned graphFocus is the canonical path.
  focusOverrides?: Record<string, string>;
  argumentOverrides?: Record<string, Record<string, GraphValue>>;
}
