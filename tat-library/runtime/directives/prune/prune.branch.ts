import type { DirectiveDefinition } from "../types.js";

export const prune_branchDirective: DirectiveDefinition = {
  name: "@prune.branch",
  family: "prune",
  astNode: "PruneBranchExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Remove a branch edge.",
};
