import type { DirectiveDefinition } from "../types.js";

export const compute_minDirective: DirectiveDefinition = {
  name: "@compute.min",
  family: "compute",
  astNode: "ComputeMinExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute a minimum from a derived source.",
};
