import type { DirectiveDefinition } from "../types.js";

export const actionApplyDirective: DirectiveDefinition = {
  name: "@action.apply",
  family: "action",
  astNode: "ApplyExpr",
  runtimeSurface: "action-pipeline",
  responsibility: "Invoke a registered action from a pipeline or runtime request.",
};
