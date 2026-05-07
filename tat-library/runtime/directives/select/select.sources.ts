import type { DirectiveDefinition } from "../types.js";

export const select_sourcesDirective: DirectiveDefinition = {
  name: "@select.sources",
  family: "select",
  astNode: "SelectSourcesExpr",
  runtimeSurface: "graph-control",
  responsibility: "Select source nodes.",
};
