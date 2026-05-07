import type { DirectiveDefinition } from "../types.js";

export const whereDirective: DirectiveDefinition = {
  name: "@where",
  family: "core",
  astNode: "WhereExpr",
  runtimeSurface: "graph-control",
  responsibility: "Evaluate boolean filtering rules for query/traversal results.",
};
