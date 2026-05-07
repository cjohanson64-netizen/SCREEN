import type { DirectiveDefinition } from "../types.js";

export const compute_countDirective: DirectiveDefinition = {
  name: "@compute.count",
  family: "compute",
  astNode: "ComputeCountExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute a count from a derived source.",
};
