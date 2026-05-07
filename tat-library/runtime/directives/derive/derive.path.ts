import type { DirectiveDefinition } from "../types.js";

export const derive_pathDirective: DirectiveDefinition = {
  name: "@derive.path",
  family: "derive",
  astNode: "DerivePathExpr",
  runtimeSurface: "graph-control",
  responsibility: "Return path traversal results.",
};
