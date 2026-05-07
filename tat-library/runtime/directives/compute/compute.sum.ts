import type { DirectiveDefinition } from "../types.js";

export const compute_sumDirective: DirectiveDefinition = {
  name: "@compute.sum",
  family: "compute",
  astNode: "ComputeSumExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute a sum from a derived source.",
};
