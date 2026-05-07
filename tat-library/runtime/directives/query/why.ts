import type { DirectiveDefinition } from "../types.js";

export const whyDirective: DirectiveDefinition = {
  name: "@why",
  family: "core",
  astNode: "WhyStatement",
  runtimeSurface: "program",
  responsibility: "Explain why a relationship exists.",
};
