import type { RuntimeBindings } from "../evaluateNodeCapture.js";
import type { ActionRegistry } from "../actionRegistry.js";

export interface GraphControlScope {
  from?: string;
  to?: string;
}

export interface GraphControlOptions {
  scope?: GraphControlScope;
  bindings?: RuntimeBindings;
  actions?: ActionRegistry;
}

