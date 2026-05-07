export type TatDirectiveMetadata = {
  name: string;
  description: string;
  insertText?: string;
};

export const TAT_DIRECTIVES: TatDirectiveMetadata[] = [
  {
    name: "@seed",
    description: "Creates a graph seed. Canonical style binds the result with :=.",
    insertText:
      '${1:graphName} := @seed {\n  nodes: [${2:root}],\n  edges: [],\n  state: {},\n  meta: {},\n  root: ${2:root},\n}',
  },
  {
    name: "@inject",
    description: "Injects validated TAT-compatible source from a registered runtime hook.",
    insertText: '<- @inject(${1:hookRef}, "${2:.py}")',
  },
  {
    name: "@graph",
    description: "Declares a graph-to-graph relationship or bridge.",
    insertText:
      '@graph(${1:g1}) : @ctx(${2:root}) :: @graph(${3:g2}) {\n  through: ${4:hookNode},\n  condition: ${5:@query.state(root, status, "ready")},\n} -> @effect {\n  -> ${6:@graft.meta(root, bridged, true)}\n}',
  },
  {
    name: "@ctx",
    description: "Selects a bridge-local contextual node in graph-to-graph syntax only.",
    insertText: "@ctx(${1:nodeRef})",
  },
  {
    name: "@effect",
    description: "Executes a graph interaction effect pipeline. Every effect step starts with ->.",
    insertText:
      "@effect {\n  -> ${1:@graft.state(root, status, active)}\n}",
  },

  {
    name: "@action.define",
    description: "Defines a reusable semantic action by name.",
    insertText:
      '@action.define(${1:actionName}) {\n  when: ${2:@query.state(root, status, "active")},\n  do: {\n    -> ${3:@graft.meta(root, lastAction, "ran")}\n  },\n  project: ${4:root},\n}',
  },
  {
    name: "@action.apply",
    description: "Invokes a previously defined semantic action.",
    insertText: "@action.apply(${1:actionName})",
  },

  {
    name: "@project.define",
    description: "Defines a reusable projection contract.",
    insertText:
      '@project.define(${1:ProjectionName}, ${2:root}) {\n  contract: {\n    ${3:id}: required,\n  },\n  fields: {\n    ${3:id}: "node",\n  },\n}',
  },
  {
    name: "@project.apply",
    description: "Applies a built-in or custom projection in projection flow.",
    insertText: "@project.apply(${1:ProjectionName}, ${2:root})",
  },

  {
    name: "@value.define",
    description: "Defines a named evaluated semantic value scope.",
    insertText:
      '@value.define(${1:valueScope}) {\n  ${2:key}: ${3:@compute.abs(1)},\n}',
  },

  {
    name: "@query.edge",
    description: "Returns true when a directed edge subject -relation-> object exists.",
    insertText: "@query.edge(${1:subject}, ${2:relation}, ${3:object})",
  },
  {
    name: "@query.state",
    description: "Returns true when node.state[key] strictly equals value.",
    insertText: '@query.state(${1:node}, ${2:key}, ${3:"value"})',
  },
  {
    name: "@query.meta",
    description: "Returns true when node.meta[key] strictly equals value.",
    insertText: '@query.meta(${1:node}, ${2:key}, ${3:"value"})',
  },
  {
    name: "@match.edge",
    description: "Matches a structural edge pattern.",
    insertText: "@match.edge(${1:root}, ${2:connectsTo}, ${3:child})",
  },
  {
    name: "@where",
    description: "Defines a contextual predicate/filter condition.",
    insertText: "@where(${1:condition})",
  },
  {
    name: "@why",
    description: "Explains cause, provenance, or evidence for a semantic result.",
    insertText: '@why(@query.state(${1:root}, ${2:status}, ${3:"active"}))',
  },
  {
    name: "@how",
    description: "Explains process/evaluation steps for supported traversal results.",
    insertText: "@how(${1:traversalValue})",
  },

  {
    name: "@path.has",
    description: "Checks whether a graph path exists.",
    insertText:
      "@path.has(${1:start}, ${2:target}) {\n  relation: ${3:connectsTo},\n  direction: ${4:outgoing},\n  depth: ${5:2},\n}",
  },
  {
    name: "@path.first",
    description: "Returns the first matching graph path structure.",
    insertText:
      "@path.first(${1:start}, ${2:target}) {\n  relation: ${3:connectsTo},\n  direction: ${4:outgoing},\n  depth: ${5:2},\n}",
  },
  {
    name: "@path.count",
    description: "Counts matching graph paths.",
    insertText:
      "@path.count(${1:start}, ${2:target}) {\n  relation: ${3:connectsTo},\n  direction: ${4:outgoing},\n  depth: ${5:2},\n}",
  },
  {
    name: "@path.through",
    description: "Returns a graph path containing required edges.",
    insertText: "@path.through(${1:start}, ${2:target}) {\n  edges: [${3:edgeOne}],\n}",
  },

  { name: "@compose", description: "Assembles graph sources with keep, prune, and merge rules.", insertText: "@compose {\n  from: [${1:graph}],\n}" },
  { name: "@bind", description: "Creates a read-only semantic alias for one evaluated expression.", insertText: "@bind(${1:aliasName}) {\n  ${2:root}\n}" },
  { name: "@repeat", description: "Repeats semantic behavior a fixed number of times.", insertText: "@repeat(${1:1}) {\n  -> ${2:@action.apply(advanceTurn)}\n}" },
  { name: "@if", description: "Branches graph execution flow.", insertText: '@if(${1:@query.state(root, status, "active")}) {\n  then: {\n    -> ${2:@graft.state(root, result, "passed")}\n  },\n  else: {\n    -> ${3:@graft.state(root, result, "failed")}\n  },\n}' },
  { name: "@when", description: "Runs graph logic when a condition/event matches.", insertText: '@when(${1:@query.edge(root, connectsTo, child)}) {\n  -> ${2:@graft.meta(root, triggered, true)}\n}' },
  { name: "@choose", description: "Returns one value from then/else branches.", insertText: '@choose(${1:condition}) {\n  then: ${2:"yes"},\n  else: ${3:"no"},\n}' },

  { name: "@graft.branch", description: "Adds a structural relationship edge.", insertText: "@graft.branch(${1:root}, ${2:connectsTo}, ${3:child})" },
  { name: "@graft.state", description: "Adds or updates state.", insertText: '@graft.state(${1:root}, ${2:status}, ${3:"active"})' },
  { name: "@graft.meta", description: "Adds or updates metadata.", insertText: '@graft.meta(${1:root}, ${2:label}, ${3:"Root"})' },
  { name: "@graft.progress", description: "Adds or updates progression/history.", insertText: "@graft.progress(${1:root}, ${2:stage}, ${3:child})" },
  { name: "@prune.branch", description: "Removes a branch/edge.", insertText: "@prune.branch(${1:root}, ${2:oldRelation}, ${3:child})" },
  { name: "@prune.state", description: "Removes state.", insertText: "@prune.state(${1:root}, ${2:oldState})" },
  { name: "@prune.meta", description: "Removes metadata.", insertText: "@prune.meta(${1:root}, ${2:oldMeta})" },
  { name: "@prune.nodes", description: "Removes nodes matching a filter.", insertText: "@prune.nodes(${1:@where(root == root)})" },
  { name: "@prune.edges", description: "Removes edges matching a filter.", insertText: "@prune.edges(${1:@where(root == root)})" },

  { name: "@runtime.addNode", description: "Adds a node at runtime.", insertText: '@runtime.addNode(${1:nodeId}, { name: "${2:Name}" }, {}, {})' },
  { name: "@runtime.updateNodeValue", description: "Updates a node value object at runtime.", insertText: '@runtime.updateNodeValue(${1:node}, { name: "${2:Name}" })' },
  { name: "@runtime.deleteNode", description: "Deletes a node at runtime.", insertText: "@runtime.deleteNode(${1:node})" },
  { name: "@runtime.generateValueId", description: "Generates a runtime value id.", insertText: '@runtime.generateValueId("${1:value}")' },
  { name: "@runtime.generateNodeId", description: "Generates a runtime node id.", insertText: '@runtime.generateNodeId("${1:node}")' },
  { name: "@runtime.nextOrder", description: "Gets the next runtime order value.", insertText: "@runtime.nextOrder()" },

  { name: "@derive.state", description: "Reads a graph-derived state value.", insertText: "@derive.state(${1:root}, ${2:status})" },
  { name: "@derive.meta", description: "Reads a graph-derived metadata value.", insertText: "@derive.meta(${1:root}, ${2:label})" },
  { name: "@derive.path", description: "Derives a graph path source.", insertText: "@derive.path(${1:root}, ${2:connectsTo}, ${3:outgoing}, ${4:2})" },
  { name: "@derive.collect", description: "Collects graph-derived values from a source.", insertText: "@derive.collect(${1:state}, ${2:score}) {\n  ${3:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.count", description: "Computes a count from a source.", insertText: "@compute.count() {\n  ${1:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.edgeCount", description: "Computes an edge count from a source.", insertText: "@compute.edgeCount(${1:root}) {\n  ${2:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.exists", description: "Computes whether a source exists.", insertText: "@compute.exists() {\n  ${1:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.sum", description: "Computes a sum from a source.", insertText: "@compute.sum(${1:score}) {\n  ${2:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.min", description: "Computes a minimum from a source.", insertText: "@compute.min(${1:score}) {\n  ${2:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.max", description: "Computes a maximum from a source.", insertText: "@compute.max(${1:score}) {\n  ${2:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.avg", description: "Computes an average from a source.", insertText: "@compute.avg(${1:score}) {\n  ${2:@derive.path(root, connectsTo, outgoing, 2)}\n}" },
  { name: "@compute.abs", description: "Computes an absolute value.", insertText: "@compute.abs(${1:number})" },

  { name: "@select.node", description: "Selects a node.", insertText: "@select.node(${1:root})" },
  { name: "@select.targets", description: "Selects immediate target nodes from a relation.", insertText: "@select.targets(${1:root}, ${2:connectsTo})" },
  { name: "@select.sources", description: "Selects immediate source nodes from a relation.", insertText: "@select.sources(${1:child}, ${2:connectsTo})" },
  { name: "@select.first", description: "Selects the first candidate.", insertText: "@select.first([${1:root}, ${2:child}])" },
  { name: "@select.only", description: "Selects exactly one candidate.", insertText: "@select.only([${1:root}])" },
  { name: "@select.from", description: "Selects the first candidate matching a where condition.", insertText: "@select.from([${1:root}, ${2:child}]) {\n  where: @where(${3:root == root}),\n}" },
];

export const VALID_DIRECTIVES = new Set(
  TAT_DIRECTIVES.map((directive) => directive.name),
);

export const DIRECTIVE_METADATA_BY_NAME = new Map(
  TAT_DIRECTIVES.map((directive) => [directive.name, directive]),
);

export function getDirectiveMetadata(
  directive: string,
): TatDirectiveMetadata | undefined {
  return DIRECTIVE_METADATA_BY_NAME.get(directive);
}
