import type { DirectiveDefinition } from "../types.js";

export const ctxDirective: DirectiveDefinition = {
  name: "@ctx",
  family: "ctx",
  astNode: "CtxExpr",
  runtimeSurface: "program",
  responsibility: "Capture context for graph pipelines/interactions.",
};
