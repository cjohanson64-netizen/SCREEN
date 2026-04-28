import type { ProjectExprNode } from "../ast/nodeTypes.js";
import type { RuntimeState } from "./executeProgram.js";
import type { Graph } from "./graph.js";
import type { ProjectFieldContext } from "./projection/projectTypes.js";

import { executeNamedProjection } from "./projection/namedProjection.js";
import { resolveProjectSpec, getProjectArgument } from "./projection/projectSpec.js";
import {
  fullIncludeSet,
  isProjectFormat,
  isProjectIncludeKey,
  PROJECT_FORMAT_RULES,
  PROJECT_FORMATS,
  PROJECT_INCLUDE_KEYS,
  type ProjectFormat,
  type ProjectIncludeKey,
} from "./projection/projectFormatRules.js";
import { projectAssignmentStatusFormat } from "./projection/assignmentStatusProjection.js";
import {
  projectAncestorsFormat,
  projectDescendantsFormat,
  projectDetailFormat,
  projectGenerationsFormat,
  projectGraphFormat,
  projectListFormat,
  projectMenuFormat,
  projectRelationshipsFormat,
  projectSiblingsFormat,
  projectSummaryFormat,
  projectTimelineFormat,
  projectTraceFormat,
  projectTreeFormat,
} from "./projection/projectionFormats.js";

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
    case "assignment_status":
      return projectAssignmentStatusFormat(context, spec);
    case "menu":
      return projectMenuFormat(context, spec);
    case "list":
      return projectListFormat(context, spec);
    case "tree":
      return projectTreeFormat(context, spec);
    case "generations":
      return projectGenerationsFormat(context, spec);
    case "timeline":
      return projectTimelineFormat(context, spec);
    case "trace":
      return projectTraceFormat(context, spec);
    case "summary":
      return projectSummaryFormat(context, spec);
    case "relationships":
      return projectRelationshipsFormat(context, spec);
    case "siblings":
      return projectSiblingsFormat(context, spec);
    case "ancestors":
      return projectAncestorsFormat(context, spec);
    case "descendants":
      return projectDescendantsFormat(context, spec);
  }
}
