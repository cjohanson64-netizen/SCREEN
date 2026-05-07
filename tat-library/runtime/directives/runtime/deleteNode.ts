import type { DirectiveDefinition } from "../types.js";

export const deleteNodeDirective: DirectiveDefinition = {
  name: "@runtime.deleteNode",
  family: "runtime",
  astNode: "RuntimeDeleteNodeExpr",
  runtimeSurface: "action-pipeline",
  responsibility: "Delete a runtime node and its incident edges.",
};
