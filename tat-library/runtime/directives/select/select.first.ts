import type { DirectiveDefinition } from "../types.js";

export const select_firstDirective: DirectiveDefinition = {
  name: "@select.first",
  family: "select",
  astNode: "SelectFirstExpr",
  runtimeSurface: "graph-control",
  responsibility: "Select the first result.",
};
