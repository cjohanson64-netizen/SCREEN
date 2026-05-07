import type { DirectiveDefinition } from "../types.js";

export const seedDirective: DirectiveDefinition = {
  name: "@seed",
  family: "core",
  astNode: "SeedBlock",
  runtimeSurface: "program",
  responsibility: "Create the initial graph, node registry, edge registry, state, meta, and root focus.",
};
