import type { DirectiveDefinition } from "../types.js";

export const matchEdgeDirective: DirectiveDefinition = {
  name: "@match.edge",
  family: "core",
  astNode: "MatchExpr",
  runtimeSurface: "parser-only",
  responsibility: "Declare graph edge pattern matching intent.",
};
