import type { DirectiveDefinition } from "../types.js";

export const queryEdgeDirective: DirectiveDefinition = {
  name: "@query.edge",
  family: "core",
  astNode: "GraphQueryExpr",
  runtimeSurface: "program",
  responsibility: "Check graph edge existence.",
};

export const queryStateDirective: DirectiveDefinition = {
  name: "@query.state",
  family: "core",
  astNode: "GraphQueryExpr",
  runtimeSurface: "program",
  responsibility: "Check graph state equality.",
};

export const queryMetaDirective: DirectiveDefinition = {
  name: "@query.meta",
  family: "core",
  astNode: "GraphQueryExpr",
  runtimeSurface: "program",
  responsibility: "Check graph metadata equality.",
};
