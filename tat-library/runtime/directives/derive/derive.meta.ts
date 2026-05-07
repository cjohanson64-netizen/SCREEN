import type { DirectiveDefinition } from "../types.js";

export const derive_metaDirective: DirectiveDefinition = {
  name: "@derive.meta",
  family: "derive",
  astNode: "DeriveMetaExpr",
  runtimeSurface: "graph-control",
  responsibility: "Read a node metadata value.",
};
