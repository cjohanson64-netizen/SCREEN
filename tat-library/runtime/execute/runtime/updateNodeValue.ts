import type { RuntimeUpdateNodeValueExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { addHistoryEntry, cloneGraphValue } from "../../graph/graph.js";

export function executeRuntimeUpdateNodeValueAction(
  step: RuntimeUpdateNodeValueExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  const nodeId = context.resolveScopedIdentifier(step.node.name);
  const patch = context.evaluateValue(step.patch);

  if (!context.isRecord(patch)) {
    throw new Error("@runtime.updateNodeValue patch must evaluate to an object");
  }

  const node = context.graph.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Graph node "${nodeId}" does not exist`);
  }

  if (!context.isRecord(node.value)) {
    throw new Error(`Graph node "${nodeId}" does not have an object value to update`);
  }

  const beforeValue = cloneGraphValue(node.value);
  node.value = {
    ...node.value,
    ...patch,
  };

  addHistoryEntry(
    context.graph,
    {
      op: "@runtime.updateNodeValue",
      payload: {
        nodeId,
        patch: cloneGraphValue(patch),
        beforeValue,
        afterValue: cloneGraphValue(node.value),
      },
    },
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
