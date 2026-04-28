import type { GraphNode, GraphValue } from "../graph.js";
import { cloneGraphValue, getOutgoingEdges } from "../graph.js";
import type { MenuPair, NormalizedEventRecord, ProjectFieldContext } from "./projectTypes.js";
import type { ProjectIncludeKey } from "./projectFormatRules.js";
import {
  cloneRecord,
  computeNodeLabel,
  computeNodeStatus,
  computeNodeType,
  deriveProjectionStatus,
  projectNodeReference,
} from "./projectionUtils.js";
import {
  buildAvailableActions,
  projectActionReference,
  resolveActionId,
} from "./projectionActions.js";
import { buildTimelineEvents } from "./projectionEvents.js";
import { getPreferredListEdges } from "./projectionTraversal.js";

export function selectNodeFields(
  node: GraphNode,
  include: ProjectIncludeKey[],
  context: ProjectFieldContext,
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};

  if (typeof node.semanticId === "string") {
    out.semanticId = node.semanticId;
  }

  if (node.contract) {
    out.contract = {
      ...(node.contract.in ? { in: [...node.contract.in] } : {}),
      ...(node.contract.out ? { out: [...node.contract.out] } : {}),
    };
  }

  for (const key of include) {
    switch (key) {
      case "id":
        out.id = node.id;
        break;
      case "label":
        out.label = computeNodeLabel(node);
        break;
      case "type": {
        const type = computeNodeType(node);
        if (type !== null) out.type = type;
        break;
      }
      case "value":
        out.value = cloneGraphValue(node.value);
        break;
      case "state":
        out.state = cloneRecord(node.state);
        break;
      case "meta":
        out.meta = cloneRecord(node.meta);
        break;
      case "relationships":
        out.relationships = getOutgoingEdges(context.graph, node.id)
          .filter((edge) => edge.kind === "branch")
          .map((edge) => ({
            relation: edge.relation,
            target: edge.object,
          }));
        break;
      case "actions":
        out.actions = buildAvailableActions(node.id, context).map((action) =>
          projectActionReference(action, resolveActionId(action)),
        );
        break;
      case "events":
        out.events = buildTimelineEvents({ ...context, focus: node.id }).map(
          (event) =>
            selectEventFields(event, [
              "id",
              "event",
              "label",
              "target",
              "action",
              "status",
            ]),
        );
        break;
      case "status":
        out.status = deriveProjectionStatus(node);
        break;
      case "action":
      case "target":
      case "event":
      case "children":
      case "counts":
        break;
    }
  }

  return out;
}

export function selectMenuFields(
  pair: MenuPair,
  include: ProjectIncludeKey[],
  context: ProjectFieldContext,
  _index: number,
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};
  const actionId = resolveMenuActionId(pair);

  for (const key of include) {
    switch (key) {
      case "id":
        out.id = `${context.focus}.${actionId}.${pair.target.id}`;
        break;
      case "label":
        out.label = `${pair.action.label} ${computeNodeLabel(pair.target)}`;
        break;
      case "action":
        out.action = projectActionReference(pair.action, actionId);
        break;
      case "target":
        out.target = projectNodeReference(pair.target);
        break;
      case "status":
        out.status = "available";
        break;
      case "meta":
        out.meta = cloneRecord(pair.target.meta);
        break;
      default:
        break;
    }
  }

  return out;
}

function resolveMenuActionId(pair: MenuPair): string {
  return resolveActionId(pair.action);
}

export function selectListFields(
  node: GraphNode,
  include: ProjectIncludeKey[],
  context: ProjectFieldContext,
  index: number,
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};

  for (const key of include) {
    switch (key) {
      case "id":
        out.id = node.id;
        break;
      case "label":
        out.label = computeNodeLabel(node);
        break;
      case "type": {
        const type = computeNodeType(node);
        if (type !== null) out.type = type;
        break;
      }
      case "value":
        out.value = cloneGraphValue(node.value);
        break;
      case "status":
        out.status = deriveProjectionStatus(node);
        break;
      case "state":
        out.state = cloneRecord(node.state);
        break;
      case "meta":
        out.meta = cloneRecord(node.meta);
        break;
      case "action": {
        const action =
          buildAvailableActions(context.focus, context)[index] ?? null;
        if (action) {
          out.action = projectActionReference(action, resolveActionId(action));
        }
        break;
      }
      case "target":
        out.target = projectNodeReference(node);
        break;
      case "event": {
        const edge =
          getPreferredListEdges(context.graph, context.focus)[index] ?? null;
        if (edge) {
          out.event = edge.relation;
        }
        break;
      }
      default:
        break;
    }
  }

  return out;
}

export function selectEventFields(
  event: NormalizedEventRecord,
  include: ProjectIncludeKey[],
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};

  for (const key of include) {
    switch (key) {
      case "id":
        out.id = event.id;
        break;
      case "step":
        if (typeof event.step === "number") out.step = event.step;
        break;
      case "from":
        if (event.from) out.from = event.from;
        break;
      case "to":
        if (event.to) out.to = event.to;
        break;
      case "label":
        out.label = event.label;
        break;
      case "raw":
        if (event.raw) out.raw = event.raw;
        break;
      case "event":
        if (event.event) out.event = event.event;
        break;
      case "target":
        if (event.target) out.target = event.target;
        break;
      case "action":
        if (event.action) out.action = event.action;
        break;
      case "status":
        if (event.status) out.status = event.status;
        break;
      case "state":
        if (event.state) out.state = event.state;
        break;
      case "meta":
        if (event.meta) out.meta = event.meta;
        break;
      case "events":
      case "actions":
      case "children":
      case "relationships":
      case "type":
      case "value":
        break;
    }
  }

  return out;
}

export function selectSummaryFields(
  node: GraphNode,
  include: ProjectIncludeKey[],
  context: ProjectFieldContext,
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};

  for (const key of include) {
    switch (key) {
      case "id":
        out.id = node.id;
        break;
      case "label":
        out.label = computeNodeLabel(node);
        break;
      case "status":
        out.status = deriveProjectionStatus(node);
        break;
      case "value":
        out.value = cloneGraphValue(node.value);
        break;
      case "state":
        out.state = cloneRecord(node.state);
        break;
      case "meta":
        out.meta = cloneRecord(node.meta);
        break;
      case "actions":
        out.actions = buildAvailableActions(node.id, context).map((action) =>
          projectActionReference(action, resolveActionId(action)),
        );
        break;
      case "counts":
        out.counts = buildSummaryCounts(context.graph);
        break;
      default:
        break;
    }
  }

  return out;
}

function buildSummaryCounts(graph: ProjectFieldContext["graph"]): Record<string, GraphValue> {
  const statusCounts: Record<string, GraphValue> = {};

  for (const node of graph.nodes.values()) {
    const status = deriveProjectionStatus(node);
    if (!status) continue;
    const current = statusCounts[status];
    statusCounts[status] = typeof current === "number" ? current + 1 : 1;
  }

  return {
    nodes: graph.nodes.size,
    edges: graph.edges.length,
    statuses: statusCounts,
  };
}
