import type { DirectiveDefinition } from "../types.js";

export const ifDirective: DirectiveDefinition = {
  name: "@if",
  family: "action",
  astNode: "IfExpr",
  runtimeSurface: "action-pipeline",
  responsibility: "Branch a graph/action pipeline based on a graph-control condition.",
};
