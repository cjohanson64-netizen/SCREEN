import type { DirectiveDefinition } from "../types.js";

export const effectDirective: DirectiveDefinition = {
  name: "@effect",
  family: "graph",
  astNode: "EffectExpr",
  runtimeSurface: "program",
  responsibility: "Define graph-to-graph effects inside graph interactions.",
};
