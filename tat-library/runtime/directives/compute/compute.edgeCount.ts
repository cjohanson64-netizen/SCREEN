import type { DirectiveDefinition } from "../types.js";

export const compute_edgeCountDirective: DirectiveDefinition = {
  name: "@compute.edgeCount",
  family: "compute",
  astNode: "ComputeEdgeCountExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute an edge count from a derived source.",
};
