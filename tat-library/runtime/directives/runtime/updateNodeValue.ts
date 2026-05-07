import type { DirectiveDefinition } from "../types.js";

export const updateNodeValueDirective: DirectiveDefinition = {
  name: "@runtime.updateNodeValue",
  family: "runtime",
  astNode: "RuntimeUpdateNodeValueExpr",
  runtimeSurface: "action-pipeline",
  responsibility: "Patch a runtime node value.",
};
