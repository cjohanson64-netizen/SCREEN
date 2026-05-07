import type { DirectiveDefinition } from "../types.js";

export const graft_stateDirective: DirectiveDefinition = {
  name: "@graft.state",
  family: "graft",
  astNode: "GraftStateExpr",
  runtimeSurface: ["graph-pipeline", "action-pipeline"],
  responsibility: "Set node state.",
};
