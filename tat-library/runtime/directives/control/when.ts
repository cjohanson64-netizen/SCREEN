import type { DirectiveDefinition } from "../types.js";

export const whenDirective: DirectiveDefinition = {
  name: "@when",
  family: "action",
  astNode: "WhenExpr",
  runtimeSurface: "program",
  responsibility: "Register/evaluate reactive triggers.",
};
