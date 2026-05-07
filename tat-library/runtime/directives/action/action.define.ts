import type { DirectiveDefinition } from "../types.js";

export const actionDefineDirective: DirectiveDefinition = {
  name: "@action.define",
  family: "action",
  astNode: "ActionExpr",
  runtimeSurface: "program",
  responsibility: "Define a named action and its mutation pipeline.",
};
