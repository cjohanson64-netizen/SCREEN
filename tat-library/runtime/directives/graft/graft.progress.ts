import type { DirectiveDefinition } from "../types.js";

export const graft_progressDirective: DirectiveDefinition = {
  name: "@graft.progress",
  family: "graft",
  astNode: "GraftProgressExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Add a progression edge.",
};
