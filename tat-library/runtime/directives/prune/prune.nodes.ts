import type { DirectiveDefinition } from "../types.js";

export const prune_nodesDirective: DirectiveDefinition = {
  name: "@prune.nodes",
  family: "prune",
  astNode: "PruneNodesExpr",
  runtimeSurface: "graph-pipeline",
  responsibility: "Remove a set of nodes.",
};
