import type { DirectiveDefinition } from "../types.js";

export const graphDirective: DirectiveDefinition = {
  name: "@graph",
  family: "graph",
  astNode: "GraphInteractionDefinition | GraphPipeline",
  runtimeSurface: "program",
  responsibility: "Define named graph pipelines/interactions.",
};
