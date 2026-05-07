import type { DirectiveDefinition } from "../types.js";

export const repeatDirective: DirectiveDefinition = {
  name: "@repeat",
  family: "action",
  astNode: "RepeatExpr",
  runtimeSurface: "action-pipeline",
  responsibility: "Repeat graph/action pipeline steps with runtime safety caps.",
};
