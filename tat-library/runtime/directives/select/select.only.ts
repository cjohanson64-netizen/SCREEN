import type { DirectiveDefinition } from "../types.js";

export const select_onlyDirective: DirectiveDefinition = {
  name: "@select.only",
  family: "select",
  astNode: "SelectOnlyExpr",
  runtimeSurface: "graph-control",
  responsibility: "Select exactly one result; fails unless there is one candidate.",
};
