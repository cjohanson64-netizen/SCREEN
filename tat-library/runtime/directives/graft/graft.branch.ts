import type { DirectiveDefinition } from "../types.js";

export const graft_branchDirective: DirectiveDefinition = {
  name: "@graft.branch",
  family: "graft",
  astNode: "GraftBranchExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Add a branch edge between two nodes.",
};
