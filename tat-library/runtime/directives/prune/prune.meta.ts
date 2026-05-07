import type { DirectiveDefinition } from "../types.js";

export const prune_metaDirective: DirectiveDefinition = {
  name: "@prune.meta",
  family: "prune",
  astNode: "PruneMetaExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Remove node metadata.",
};
