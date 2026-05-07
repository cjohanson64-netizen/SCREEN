import type { DirectiveDefinition } from "../types.js";

export const projectDefineDirective: DirectiveDefinition = {
  name: "@project.define",
  family: "projection",
  astNode: "ProjectionDef",
  runtimeSurface: "projection",
  responsibility: "Define named reusable projection specs.",
};
