import type { DirectiveDefinition } from "../types.js";

export const select_targetsDirective: DirectiveDefinition = {
  name: "@select.targets",
  family: "select",
  astNode: "SelectTargetsExpr",
  runtimeSurface: "graph-control",
  responsibility: "Select target nodes.",
};
