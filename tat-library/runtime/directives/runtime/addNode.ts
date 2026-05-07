import type { DirectiveDefinition } from "../types.js";

export const addNodeDirective: DirectiveDefinition = {
  name: "@runtime.addNode",
  family: "runtime",
  astNode: "RuntimeAddNodeExpr",
  runtimeSurface: "action-pipeline",
  responsibility: "Create a runtime-generated node.",
};
