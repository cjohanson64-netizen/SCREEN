import type { ProjectExprNode } from "../../ast/nodeTypes.js";
import type { RuntimeState } from "../engine/executeProgram.js";
import type { Graph } from "../graph/graph.js";
import type { ProjectFieldContext } from "./projectTypes.js";
import { profileOperation } from "../instrumentation/profiler.js";

import { executeNamedProjection } from "./namedProjection.js";
import { resolveProjectSpec, getProjectArgument } from "./projectSpec.js";
import {
  fullIncludeSet,
  isProjectFormat,
  isProjectIncludeKey,
  PROJECT_FORMAT_RULES,
  PROJECT_FORMATS,
  PROJECT_INCLUDE_KEYS,
  type ProjectFormat,
  type ProjectIncludeKey,
} from "./projectFormatRules.js";
import {
  projectCollectionFormat,
  projectDetailFormat,
  projectGraphFormat,
  projectRelationshipsFormat,
  projectSummaryFormat,
  projectTimelineFormat,
  projectTraceFormat,
  projectTreeFormat,
} from "./projectionFormats.js";

export {
  fullIncludeSet,
  getProjectArgument,
  isProjectFormat,
  isProjectIncludeKey,
  PROJECT_FORMAT_RULES,
  PROJECT_FORMATS,
  PROJECT_INCLUDE_KEYS,
  resolveProjectSpec,
};
export type { ProjectFormat, ProjectIncludeKey };

export function projectGraphResult(
  graph: Graph,
  projection: ProjectExprNode | null,
  state: RuntimeState,
): unknown {
  return profileOperation(state.profiler, "@project.apply", () =>
    projectGraphResultUnprofiled(graph, projection, state),
  );
}

function projectGraphResultUnprofiled(
  graph: Graph,
  projection: ProjectExprNode | null,
  state: RuntimeState,
): unknown {
  if (projection?.projectionName) {
    return executeNamedProjection(graph, projection, state);
  }

  const spec = resolveProjectSpec(graph, projection, state);
  const context: ProjectFieldContext = {
    graph,
    focus: spec.focus,
    bindings: state.bindings,
    actions: state.actions,
  };

  switch (spec.format) {
    case "graph":
      return projectGraphFormat(context, spec);
    case "detail":
      return projectDetailFormat(context, spec);
    case "tree":
      return projectTreeFormat(context, spec);
    case "collection":
      return projectCollectionFormat(context, spec);
    case "timeline":
      return projectTimelineFormat(context, spec);
    case "trace":
      return projectTraceFormat(context, spec);
    case "summary":
      return projectSummaryFormat(context, spec);
    case "relationships":
      return projectRelationshipsFormat(context, spec);
  }
}
