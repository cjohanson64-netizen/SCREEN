import type { DirectiveDefinition } from "../types.js";

export const derive_collectDirective: DirectiveDefinition = {
  name: "@derive.collect",
  family: "derive",
  astNode: "DeriveCollectExpr",
  runtimeSurface: "graph-control",
  responsibility: "Collect graph-control results.",
};
