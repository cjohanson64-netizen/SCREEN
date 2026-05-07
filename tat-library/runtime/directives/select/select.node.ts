import type { DirectiveDefinition } from "../types.js";

export const select_nodeDirective: DirectiveDefinition = {
  name: "@select.node",
  family: "select",
  astNode: "SelectNodeExpr",
  runtimeSurface: "graph-control",
  responsibility: "Select a node from graph-control results.",
};
