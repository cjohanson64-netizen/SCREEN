import type { DirectiveDefinition } from "../types.js";

export const generateNodeIdDirective: DirectiveDefinition = {
  name: "@runtime.generateNodeId",
  family: "runtime",
  astNode: "RuntimeGenerateNodeIdExpr",
  runtimeSurface: "graph-control",
  responsibility: "Generate a stable runtime node id.",
};
