import type { DirectiveDefinition } from "../types.js";

export const compute_avgDirective: DirectiveDefinition = {
  name: "@compute.avg",
  family: "compute",
  astNode: "ComputeAvgExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute an average from a derived source.",
};
