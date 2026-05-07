import type { DirectiveDefinition } from "../types.js";

export const compute_absDirective: DirectiveDefinition = {
  name: "@compute.abs",
  family: "compute",
  astNode: "ComputeAbsExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute an absolute value.",
};
