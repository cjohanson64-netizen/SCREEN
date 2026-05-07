import type { DirectiveDefinition } from "../types.js";

export const select_fromDirective: DirectiveDefinition = {
  name: "@select.from",
  family: "select",
  astNode: "SelectFromExpr",
  runtimeSurface: "graph-control",
  responsibility: "Select the first candidate matching a where condition.",
};
