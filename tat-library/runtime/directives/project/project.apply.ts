import type { DirectiveDefinition } from "../types.js";

export const projectApplyDirective: DirectiveDefinition = {
  name: "@project.apply",
  family: "projection",
  astNode: "ProjectExpr",
  runtimeSurface: "projection",
  responsibility: "Apply a named projection to graph state.",
};
