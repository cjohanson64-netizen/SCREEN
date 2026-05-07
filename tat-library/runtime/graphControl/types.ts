import type { RuntimeBindings } from "../query/evaluateNodeCapture.js";
import type { ActionRegistry } from "../engine/actionRegistry.js";
import type { RuntimeProfiler } from "../instrumentation/profiler.js";

export interface GraphControlScope {
  from?: string;
  to?: string;
}

export interface GraphControlOptions {
  scope?: GraphControlScope;
  bindings?: RuntimeBindings;
  actions?: ActionRegistry;
  profiler?: RuntimeProfiler;
}

