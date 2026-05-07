import type { DirectiveDefinition } from "../types.js";

export const derive_stateDirective: DirectiveDefinition = {
  name: "@derive.state",
  family: "derive",
  astNode: "DeriveStateExpr",
  runtimeSurface: "graph-control",
  responsibility: "Read a node state value.",
};
