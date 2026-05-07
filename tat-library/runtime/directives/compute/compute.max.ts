import type { DirectiveDefinition } from "../types.js";

export const compute_maxDirective: DirectiveDefinition = {
  name: "@compute.max",
  family: "compute",
  astNode: "ComputeMaxExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute a maximum from a derived source.",
};
