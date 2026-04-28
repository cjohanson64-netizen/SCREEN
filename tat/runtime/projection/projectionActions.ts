import type { ActionRegistry } from "../actionRegistry.js";
import type { GraphNode, GraphValue } from "../graph.js";
import { getOutgoingEdges } from "../graph.js";
import { evaluateActionGuard } from "../executeAction.js";
import { getAction } from "../actionRegistry.js";
import type { MenuPair, ProjectFieldContext, ResolvedActionCandidate } from "./projectTypes.js";
import { computeNodeLabel, isRecord, projectNodeReference, titleCase } from "./projectionUtils.js";

export function buildAvailableActions(
  focus: string,
  context: ProjectFieldContext,
): ResolvedActionCandidate[] {
  const menuPairs = buildMenuPairs({ ...context, focus });
  const seen = new Set<string>();
  const actions: ResolvedActionCandidate[] = [];

  for (const pair of menuPairs) {
    const actionId = resolveActionId(pair.action);
    if (seen.has(actionId)) continue;
    seen.add(actionId);
    actions.push(pair.action);
  }

  return actions;
}

export function buildMenuPairs(context: ProjectFieldContext): MenuPair[] {
  const actionCandidates = getOutgoingEdges(context.graph, context.focus)
    .filter((edge) => edge.kind === "branch" && edge.relation === "can")
    .map((edge) => resolveActionCandidate(edge.object, context));

  const targetCandidates = getOutgoingEdges(context.graph, context.focus)
    .filter((edge) => edge.kind === "branch" && edge.relation === "targets")
    .map((edge) => context.graph.nodes.get(edge.object)!);

  const pairs: MenuPair[] = [];

  for (const action of actionCandidates) {
    const runtimeAction = getAction(context.actions, action.bindingName);
    const constrainedTargetIds = getActionSpecificTargetIds(action, context);
    const eligibleTargets =
      constrainedTargetIds.size > 0
        ? targetCandidates.filter((target) =>
            constrainedTargetIds.has(target.id),
          )
        : targetCandidates;

    for (const target of eligibleTargets) {
      if (runtimeAction?.guard) {
        const scope = { from: context.focus, to: target.id };
        const passes = evaluateActionGuard(
          runtimeAction.guard,
          context.graph,
          scope,
        );
        if (!passes) continue;
      }
      pairs.push({ action, target });
    }
  }

  return pairs;
}

function getActionSpecificTargetIds(
  action: ResolvedActionCandidate,
  context: ProjectFieldContext,
): Set<string> {
  if (!action.sourceNode) {
    return new Set<string>();
  }

  return new Set(
    getOutgoingEdges(context.graph, action.sourceNode.id)
      .filter((edge) => edge.kind === "branch" && edge.relation === "targets")
      .map((edge) => edge.object),
  );
}

function resolveActionCandidate(
  nodeId: string,
  context: ProjectFieldContext,
): ResolvedActionCandidate {
  const node = context.graph.nodes.get(nodeId);

  if (!node) {
    return {
      id: nodeId,
      label: titleCase(nodeId),
      bindingName: nodeId,
      sourceNode: null,
    };
  }

  const bindingName =
    resolveExplicitActionBinding(node, context.actions) ??
    resolveLegacyActionBinding(node, context.actions) ??
    node.id;

  return {
    id: node.id,
    label: computeNodeLabel(node),
    bindingName,
    sourceNode: node,
  };
}

export function resolveActionId(action: ResolvedActionCandidate): string {
  return action.bindingName;
}

function resolveExplicitActionBinding(
  node: GraphNode,
  actions: ActionRegistry,
): string | null {
  const valueActionKey =
    isRecord(node.value) && typeof node.value.actionKey === "string"
      ? node.value.actionKey
      : null;
  if (valueActionKey && actions.has(valueActionKey)) {
    return valueActionKey;
  }

  const metaActionKey =
    typeof node.meta.actionKey === "string" ? node.meta.actionKey : null;
  if (metaActionKey && actions.has(metaActionKey)) {
    return metaActionKey;
  }

  return null;
}

function resolveLegacyActionBinding(
  node: GraphNode,
  actions: ActionRegistry,
): string | null {
  const directBinding = actions.has(node.id) ? node.id : null;
  const metaBinding =
    typeof node.meta.actionBinding === "string" &&
    actions.has(node.meta.actionBinding)
      ? node.meta.actionBinding
      : typeof node.meta.action === "string" && actions.has(node.meta.action)
        ? node.meta.action
        : null;
  const valueBinding =
    isRecord(node.value) &&
    typeof node.value.binding === "string" &&
    actions.has(node.value.binding)
      ? node.value.binding
      : isRecord(node.value) &&
          typeof node.value.action === "string" &&
          actions.has(node.value.action)
        ? node.value.action
        : null;
  const valueIdBinding =
    isRecord(node.value) &&
    typeof node.value.id === "string" &&
    actions.has(node.value.id)
      ? node.value.id
      : null;
  const strippedNodeId = node.id.endsWith("Node")
    ? node.id.slice(0, -"Node".length)
    : null;
  const strippedBinding =
    strippedNodeId !== null && actions.has(strippedNodeId)
      ? strippedNodeId
      : null;

  return (
    directBinding ??
    metaBinding ??
    valueBinding ??
    valueIdBinding ??
    strippedBinding
  );
}

export function resolveActionCandidateFromEvent(
  context: ProjectFieldContext,
  from: string | undefined,
  action: string | undefined,
): ResolvedActionCandidate | null {
  if (!from || !action || !context.graph.nodes.has(from)) {
    return null;
  }

  const candidates = buildAvailableActions(from, { ...context, focus: from });
  return (
    candidates.find(
      (candidate) =>
        resolveActionId(candidate) === action ||
        candidate.bindingName === action ||
        candidate.id === action,
    ) ?? null
  );
}

export function projectActionReference(
  action: ResolvedActionCandidate,
  actionId = resolveActionId(action),
): GraphValue {
  if (!action.sourceNode) {
    return {
      id: actionId,
      label: action.label,
      value: {},
      state: {},
      meta: {},
    };
  }

  return {
    ...projectNodeReference(action.sourceNode),
    id: actionId,
  };
}
