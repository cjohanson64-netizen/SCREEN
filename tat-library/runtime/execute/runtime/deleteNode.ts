import type { RuntimeDeleteNodeExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { addHistoryEntry, cloneGraphValue, removeNode } from "../../graph/graph.js";

export function executeRuntimeDeleteNodeAction(
  step: RuntimeDeleteNodeExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  const nodeId = context.resolveScopedIdentifier(step.node.name);
  const node = context.graph.nodes.get(nodeId);

  if (!node) {
    return;
  }

  const removedEdges = context.graph.edges
    .filter((edge) => edge.subject === nodeId || edge.object === nodeId)
    .map((edge) => ({
      subject: edge.subject,
      relation: edge.relation,
      object: edge.object,
      kind: edge.kind,
      meta: cloneGraphValue(edge.meta),
    }));

  addHistoryEntry(
    context.graph,
    {
      op: "@runtime.deleteNode",
      payload: {
        nodeId,
        value: cloneGraphValue(node.value),
        state: cloneGraphValue(node.state),
        meta: cloneGraphValue(node.meta),
        removedEdges: cloneGraphValue(removedEdges),
      },
    },
    { causedBy: context.hooks?.causedBy },
  );
  removeNode(context.graph, nodeId);
  context.markMutation();
}
