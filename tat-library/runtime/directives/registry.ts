import type { DirectiveDefinition, DirectiveFamily } from "./types.js";
import { howDirective } from "./query/how.js";
import { matchEdgeDirective } from "./query/match.edge.js";
import { pathDirective } from "./path/path.js";
import { queryEdgeDirective, queryStateDirective, queryMetaDirective } from "./query/query.js";
import { seedDirective } from "./graph/seed.js";
import { whereDirective } from "./query/where.js";
import { whyDirective } from "./query/why.js";
import { composeDirective } from "./graph/compose.js";
import { projectApplyDirective } from "./project/project.apply.js";
import { projectDefineDirective } from "./project/project.define.js";
import { effectDirective } from "./graph/effect.js";
import { graphDirective } from "./graph/graph.js";
import { actionDefineDirective } from "./action/action.define.js";
import { actionApplyDirective } from "./action/action.apply.js";
import { ifDirective } from "./control/if.js";
import { repeatDirective } from "./control/repeat.js";
import { whenDirective } from "./control/when.js";
import { bindDirective } from "./bind/bind.js";
import { ctxDirective } from "./ctx/ctx.js";
import { addNodeDirective } from "./runtime/addNode.js";
import { deleteNodeDirective } from "./runtime/deleteNode.js";
import { generateNodeIdDirective } from "./runtime/generateNodeId.js";
import { generateValueIdDirective } from "./runtime/generateValueId.js";
import { nextOrderDirective } from "./runtime/nextOrder.js";
import { updateNodeValueDirective } from "./runtime/updateNodeValue.js";
import { graft_branchDirective } from "./graft/graft.branch.js";
import { graft_metaDirective } from "./graft/graft.meta.js";
import { graft_progressDirective } from "./graft/graft.progress.js";
import { graft_stateDirective } from "./graft/graft.state.js";
import { prune_branchDirective } from "./prune/prune.branch.js";
import { prune_edgesDirective } from "./prune/prune.edges.js";
import { prune_metaDirective } from "./prune/prune.meta.js";
import { prune_nodesDirective } from "./prune/prune.nodes.js";
import { prune_stateDirective } from "./prune/prune.state.js";
import { derive_collectDirective } from "./derive/derive.collect.js";
import { derive_metaDirective } from "./derive/derive.meta.js";
import { derive_pathDirective } from "./derive/derive.path.js";
import { derive_stateDirective } from "./derive/derive.state.js";
import { compute_countDirective } from "./compute/compute.count.js";
import { compute_edgeCountDirective } from "./compute/compute.edgeCount.js";
import { compute_existsDirective } from "./compute/compute.exists.js";
import { compute_sumDirective } from "./compute/compute.sum.js";
import { compute_minDirective } from "./compute/compute.min.js";
import { compute_maxDirective } from "./compute/compute.max.js";
import { compute_avgDirective } from "./compute/compute.avg.js";
import { compute_absDirective } from "./compute/compute.abs.js";
import { select_firstDirective } from "./select/select.first.js";
import { select_nodeDirective } from "./select/select.node.js";
import { select_sourcesDirective } from "./select/select.sources.js";
import { select_targetsDirective } from "./select/select.targets.js";
import { select_onlyDirective } from "./select/select.only.js";
import { select_fromDirective } from "./select/select.from.js";

export const directiveRegistry = [
  howDirective,
  matchEdgeDirective,
  pathDirective,
  queryEdgeDirective,
  queryStateDirective,
  queryMetaDirective,
  seedDirective,
  whereDirective,
  whyDirective,
  composeDirective,
  projectApplyDirective,
  projectDefineDirective,
  effectDirective,
  graphDirective,
  actionDefineDirective,
  actionApplyDirective,
  ifDirective,
  repeatDirective,
  whenDirective,
  bindDirective,
  ctxDirective,
  addNodeDirective,
  deleteNodeDirective,
  generateNodeIdDirective,
  generateValueIdDirective,
  nextOrderDirective,
  updateNodeValueDirective,
  graft_branchDirective,
  graft_metaDirective,
  graft_progressDirective,
  graft_stateDirective,
  prune_branchDirective,
  prune_edgesDirective,
  prune_metaDirective,
  prune_nodesDirective,
  prune_stateDirective,
  derive_collectDirective,
  derive_metaDirective,
  derive_pathDirective,
  derive_stateDirective,
  compute_countDirective,
  compute_edgeCountDirective,
  compute_existsDirective,
  compute_sumDirective,
  compute_minDirective,
  compute_maxDirective,
  compute_avgDirective,
  compute_absDirective,
  select_firstDirective,
  select_nodeDirective,
  select_onlyDirective,
  select_fromDirective,
  select_sourcesDirective,
  select_targetsDirective,
] as const satisfies readonly DirectiveDefinition[];

export type KnownDirectiveName = (typeof directiveRegistry)[number]["name"];

export const directiveByName = new Map(
  directiveRegistry.map((directive) => [directive.name, directive]),
);

export function getDirectiveDefinition(name: string): DirectiveDefinition | undefined {
  return directiveByName.get(name);
}

export function listDirectivesByFamily(family: DirectiveFamily): DirectiveDefinition[] {
  return directiveRegistry.filter((directive) => directive.family === family);
}
