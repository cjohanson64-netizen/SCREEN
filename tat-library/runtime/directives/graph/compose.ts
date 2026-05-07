import type { DirectiveDefinition } from "../types.js";

export const composeDirective: DirectiveDefinition = {
  name: "@compose",
  family: "projection",
  astNode: "ComposeExpr",
  runtimeSurface: "program",
  responsibility: "Compose previously declared assets into runtime bindings.",
};
