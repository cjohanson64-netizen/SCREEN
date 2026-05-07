import type { DirectiveDefinition } from "../types.js";

export const prune_edgesDirective: DirectiveDefinition = {
  name: "@prune.edges",
  family: "prune",
  astNode: "PruneEdgesExpr",
  runtimeSurface: "graph-pipeline",
  responsibility: "Remove a set of edges.",
};
