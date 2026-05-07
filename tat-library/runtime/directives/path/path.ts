import type { DirectiveDefinition } from "../types.js";

export const pathDirective: DirectiveDefinition = {
  name: "@path",
  family: "core",
  astNode: "PathStatement | DerivePathExpr",
  runtimeSurface: "graph-control",
  responsibility: "Evaluate graph path traversal semantics.",
};
