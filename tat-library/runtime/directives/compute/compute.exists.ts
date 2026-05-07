import type { DirectiveDefinition } from "../types.js";

export const compute_existsDirective: DirectiveDefinition = {
  name: "@compute.exists",
  family: "compute",
  astNode: "ComputeExistsExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute whether a derived source exists.",
};
