import type { DirectiveDefinition } from "../types.js";

export const graft_metaDirective: DirectiveDefinition = {
  name: "@graft.meta",
  family: "graft",
  astNode: "GraftMetaExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Set node metadata.",
};
