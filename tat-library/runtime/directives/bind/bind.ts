import type { DirectiveDefinition } from "../types.js";

export const bindDirective: DirectiveDefinition = {
  name: "@bind",
  family: "bind",
  astNode: "BindStatement",
  runtimeSurface: "binding",
  responsibility: "Bind an identifier to a graph/runtime value.",
};
