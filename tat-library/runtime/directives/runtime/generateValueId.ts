import type { DirectiveDefinition } from "../types.js";

export const generateValueIdDirective: DirectiveDefinition = {
  name: "@runtime.generateValueId",
  family: "runtime",
  astNode: "RuntimeGenerateValueIdExpr",
  runtimeSurface: "graph-control",
  responsibility: "Generate a stable runtime value id.",
};
