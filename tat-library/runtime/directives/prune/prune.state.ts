import type { DirectiveDefinition } from "../types.js";

export const prune_stateDirective: DirectiveDefinition = {
  name: "@prune.state",
  family: "prune",
  astNode: "PruneStateExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Remove node state.",
};
