import type { DirectiveDefinition } from "../types.js";

export const nextOrderDirective: DirectiveDefinition = {
  name: "@runtime.nextOrder",
  family: "runtime",
  astNode: "RuntimeNextOrderExpr",
  runtimeSurface: "graph-control",
  responsibility: "Compute the next runtime ordering value.",
};
