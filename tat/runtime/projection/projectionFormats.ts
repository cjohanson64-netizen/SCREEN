import type { GraphValue } from "../graph.js";
import { cloneGraphValue, getIncomingEdges, getNode, getOutgoingEdges } from "../graph.js";
import type { ProjectFieldContext, ProjectSpec } from "./projectTypes.js";
import {
  cloneRecord as awaitImport_cloneRecord,
  compareProjectionNodes,
  computeNodeLabel as awaitImport_computeNodeLabel,
  computeNodeStatus as awaitImport_computeNodeStatus,
  computeNodeType as awaitImport_computeNodeType,
  deriveProjectionStatus as awaitImport_deriveProjectionStatus,
  isBirthParentEdge,
  isSpouseEdge,
  isStepParentEdge,
  projectNodeReference,
  resolveFocusNode,
} from "./projectionUtils.js";
import {
  selectEventFields,
  selectListFields,
  selectMenuFields,
  selectNodeFields,
  selectSummaryFields,
} from "./projectionSelection.js";
import {
  buildMenuPairs,
} from "./projectionActions.js";
import {
  buildTimelineEvents,
  buildTraceEvents,
} from "./projectionEvents.js";
import {
  collectGenerationDepths,
  collectProjectedPathNeighbors,
  collectProjectedPathNodeIds,
  getPreferredListEdges,
  getPreferredTreeEdges,
  projectGenerationNodes,
  projectRelationshipNodes,
} from "./projectionTraversal.js";

export function projectGraphFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "graph";
  focus: string;
  nodes: Array<Record<string, GraphValue>>;
  edges: Array<Record<string, GraphValue>>;
} {
  const focusNode = getNode(context.graph, spec.focus);
  const reachableEdges = getOutgoingEdges(context.graph, spec.focus);
  const reachableIds = new Set<string>([
    spec.focus,
    ...reachableEdges.map((edge) => edge.object),
  ]);

  return {
    format: "graph",
    focus: spec.focus,
    nodes: Array.from(reachableIds).map((nodeId) =>
      selectNodeFields(getNode(context.graph, nodeId), spec.include, context),
    ),
    edges: reachableEdges.map((edge) => ({
      id: edge.id,
      relation: edge.relation,
      source: edge.subject,
      target: edge.object,
      kind: edge.kind,
      meta: cloneGraphValue(edge.meta),
      context: edge.context === null ? null : cloneGraphValue(edge.context),
      focus: focusNode.id,
    })),
  };
}

export function projectDetailFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "detail";
  focus: Record<string, GraphValue>;
  node: Record<string, GraphValue>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);

  return {
    format: "detail",
    focus: projectNodeReference(focusNode),
    node: selectNodeFields(focusNode, spec.include, context),
  };
}

export function projectMenuFormat(context: ProjectFieldContext, spec: ProjectSpec) {
  return {
    format: "menu",
    focus: projectNodeReference(getNode(context.graph, spec.focus)),
    items: buildMenuPairs(context).map((pair, index) =>
      selectMenuFields(pair, spec.include, context, index),
    ),
  };
}

export function projectTreeFormat(context: ProjectFieldContext, spec: ProjectSpec) {
  return {
    format: "tree",
    focus: projectNodeReference(getNode(context.graph, spec.focus)),
    tree: buildTreeNode(
      spec.focus,
      spec.include,
      context,
      new Set<string>(),
    ),
  };
}

export function projectTimelineFormat(context: ProjectFieldContext, spec: ProjectSpec) {
  return {
    format: "timeline",
    focus: projectNodeReference(getNode(context.graph, spec.focus)),
    events: buildTimelineEvents(context).map((event) =>
      selectEventFields(event, spec.include),
    ),
  };
}

export function projectTraceFormat(context: ProjectFieldContext, spec: ProjectSpec) {
  return {
    format: "trace",
    focus: projectNodeReference(getNode(context.graph, spec.focus)),
    steps: buildTraceEvents(context).map((event) =>
      selectEventFields(event, spec.include),
    ),
  };
}

export function projectListFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "list";
  focus: Record<string, GraphValue>;
  items: Array<Record<string, GraphValue>>;
} {
  return {
    format: "list",
    focus: projectNodeReference(resolveFocusNode(context.graph, spec.focus)),
    items: getPreferredListEdges(context.graph, spec.focus).map((edge, index) =>
      selectListFields(
        getNode(context.graph, edge.object),
        spec.include,
        context,
        index,
      ),
    ),
  };
}

export function projectSummaryFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "summary";
  focus: Record<string, GraphValue>;
  data: Record<string, GraphValue>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);

  return {
    format: "summary",
    focus: projectNodeReference(focusNode),
    data: selectSummaryFields(focusNode, spec.include, context),
  };
}

export function projectRelationshipsFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "relationships";
  focus: Record<string, GraphValue>;
  parents: Array<Record<string, GraphValue>>;
  birthParents: Array<Record<string, GraphValue>>;
  stepParents: Array<Record<string, GraphValue>>;
  spouses: Array<Record<string, GraphValue>>;
  children: Array<Record<string, GraphValue>>;
  birthChildren: Array<Record<string, GraphValue>>;
  stepChildren: Array<Record<string, GraphValue>>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);
  const birthParents = projectRelationshipNodes(
    getIncomingEdges(context.graph, spec.focus, "branch").filter((edge) =>
      isBirthParentEdge(edge),
    ),
    "subject",
    spec.include,
    context,
  );
  const stepParents = projectRelationshipNodes(
    getIncomingEdges(context.graph, spec.focus, "branch").filter((edge) =>
      isStepParentEdge(edge),
    ),
    "subject",
    spec.include,
    context,
  );
  const spouses = projectRelationshipNodes(
    [
      ...getOutgoingEdges(context.graph, spec.focus, "branch").filter((edge) =>
        isSpouseEdge(edge),
      ),
      ...getIncomingEdges(context.graph, spec.focus, "branch").filter((edge) =>
        isSpouseEdge(edge),
      ),
    ],
    "other",
    spec.include,
    context,
    spec.focus,
  );
  const birthChildren = projectRelationshipNodes(
    getOutgoingEdges(context.graph, spec.focus, "branch").filter((edge) =>
      isBirthParentEdge(edge),
    ),
    "object",
    spec.include,
    context,
  );
  const stepChildren = projectRelationshipNodes(
    getOutgoingEdges(context.graph, spec.focus, "branch").filter((edge) =>
      isStepParentEdge(edge),
    ),
    "object",
    spec.include,
    context,
  );

  return {
    format: "relationships",
    focus: projectNodeReference(focusNode),
    parents: birthParents,
    birthParents,
    stepParents,
    spouses,
    children: birthChildren,
    birthChildren,
    stepChildren,
  };
}

export function projectSiblingsFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "siblings";
  focus: Record<string, GraphValue>;
  siblings: Array<Record<string, GraphValue>>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);
  const parentIds = getIncomingEdges(context.graph, spec.focus, "branch")
    .filter((edge) => isBirthParentEdge(edge))
    .map((edge) => edge.subject);
  const siblingIds = new Set<string>();

  for (const parentId of parentIds) {
    const childEdges = getOutgoingEdges(
      context.graph,
      parentId,
      "branch",
    ).filter((edge) => isBirthParentEdge(edge));

    for (const edge of childEdges) {
      if (edge.object !== spec.focus) {
        siblingIds.add(edge.object);
      }
    }
  }

  return {
    format: "siblings",
    focus: projectNodeReference(focusNode),
    siblings: [...siblingIds]
      .map((nodeId) => getNode(context.graph, nodeId))
      .sort(compareProjectionNodes)
      .map((node) => selectNodeFields(node, spec.include, context)),
  };
}

export function projectAncestorsFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "ancestors";
  focus: Record<string, GraphValue>;
  depth: number;
  ancestors: Array<Record<string, GraphValue>>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);
  const depth = spec.depth ?? 1;
  const nodeIds = collectProjectedPathNodeIds(
    context.graph,
    spec.focus,
    ["parentOf", "birthParent"],
    "incoming",
    depth,
  );

  return {
    format: "ancestors",
    focus: projectNodeReference(focusNode),
    depth,
    ancestors: nodeIds
      .map((nodeId) => getNode(context.graph, nodeId))
      .sort(compareProjectionNodes)
      .map((node) => selectNodeFields(node, spec.include, context)),
  };
}

export function projectDescendantsFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "descendants";
  focus: Record<string, GraphValue>;
  depth: number;
  descendants: Array<Record<string, GraphValue>>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);
  const depth = spec.depth ?? 1;
  const nodeIds = collectProjectedPathNodeIds(
    context.graph,
    spec.focus,
    ["parentOf", "birthParent"],
    "outgoing",
    depth,
  );

  return {
    format: "descendants",
    focus: projectNodeReference(focusNode),
    depth,
    descendants: nodeIds
      .map((nodeId) => getNode(context.graph, nodeId))
      .sort(compareProjectionNodes)
      .map((node) => selectNodeFields(node, spec.include, context)),
  };
}

export function projectGenerationsFormat(
  context: ProjectFieldContext,
  spec: ProjectSpec,
): {
  format: "generations";
  focus: Record<string, GraphValue>;
  generations: Record<string, Array<Record<string, GraphValue>>>;
} {
  const focusNode = resolveFocusNode(context.graph, spec.focus);
  const spouseIds = collectProjectedPathNeighbors(
    context.graph,
    spec.focus,
    new Set(["spouse", "spouseOf"]),
    "both",
  );
  const ancestorDepths = collectGenerationDepths(
    context.graph,
    spec.focus,
    "incoming",
    3,
  );
  const descendantDepths = collectGenerationDepths(
    context.graph,
    spec.focus,
    "outgoing",
    1,
  );

  return {
    format: "generations",
    focus: projectNodeReference(focusNode),
    generations: {
      "3": projectGenerationNodes(
        ancestorDepths.get(3) ?? [],
        spec.include,
        context,
      ),
      "2": projectGenerationNodes(
        ancestorDepths.get(2) ?? [],
        spec.include,
        context,
      ),
      "1": projectGenerationNodes(
        ancestorDepths.get(1) ?? [],
        spec.include,
        context,
      ),
      "0": projectGenerationNodes(
        [spec.focus, ...spouseIds.filter((nodeId) => nodeId !== spec.focus)],
        spec.include,
        context,
      ),
      "-1": projectGenerationNodes(
        descendantDepths.get(1) ?? [],
        spec.include,
        context,
      ),
    },
  };
}

function buildTreeNode(
  nodeId: string,
  include: ProjectSpec["include"],
  context: ProjectFieldContext,
  visited: Set<string>,
): Record<string, GraphValue> {
  const node = getNode(context.graph, nodeId);
  const out: Record<string, GraphValue> = {};
  visited.add(nodeId);

  for (const key of include) {
    switch (key) {
      case "id":
        out.id = node.id;
        break;
      case "label":
        out.label = (awaitImport_computeNodeLabel(node));
        break;
      case "type": {
        const type = awaitImport_computeNodeType(node);
        if (type !== null) out.type = type;
        break;
      }
      case "value":
        out.value = cloneGraphValue(node.value);
        break;
      case "state":
        out.state = awaitImport_cloneRecord(node.state);
        break;
      case "status":
        out.status = awaitImport_deriveProjectionStatus(node) ?? awaitImport_computeNodeStatus(node);
        break;
      case "meta":
        out.meta = awaitImport_cloneRecord(node.meta);
        break;
      case "children":
        out.children = getPreferredTreeEdges(context.graph, nodeId)
          .filter((edge) => !visited.has(edge.object))
          .map((edge) => buildTreeNode(edge.object, include, context, visited));
        break;
      default:
        break;
    }
  }

  return out;
}

