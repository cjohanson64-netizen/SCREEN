import type { DirectiveDefinition } from "../types.js";

export const howDirective: DirectiveDefinition = {
  name: "@how",
  family: "core",
  astNode: "HowStatement",
  runtimeSurface: "program",
  responsibility: "Explain how to traverse from one node to another.",
};
