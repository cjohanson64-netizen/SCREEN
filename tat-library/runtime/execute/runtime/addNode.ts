import type { RuntimeAddNodeExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { addHistoryEntry, addNode, cloneGraphValue } from "../../graph/graph.js";

export function executeRuntimeAddNodeAction(
  step: RuntimeAddNodeExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  const nodeId = context.resolveRuntimeAddNodeTarget(step.node);
  const value = context.evaluateValue(step.value);
  const extractedValue = context.extractRuntimeNodeValue(value);
  const stateValue = context.evaluateValue(step.state);
  const metaValue = context.evaluateValue(step.meta);

  if (!context.isRecord(stateValue)) {
    throw new Error("@runtime.addNode state must evaluate to an object");
  }

  if (!context.isRecord(metaValue)) {
    throw new Error("@runtime.addNode meta must evaluate to an object");
  }

  addNode(context.graph, {
    id: nodeId,
    semanticId: extractedValue.semanticId,
    contract: context.cloneNodeContract(extractedValue.contract),
    value: extractedValue.value,
    state: stateValue,
    meta: metaValue,
  });

  addHistoryEntry(
    context.graph,
    {
      op: "@runtime.addNode",
      payload: {
        nodeId,
        semanticId: extractedValue.semanticId ?? null,
        contract: extractedValue.contract
          ? context.contractToGraphValue(extractedValue.contract)
          : null,
        value: cloneGraphValue(extractedValue.value),
        state: cloneGraphValue(stateValue),
        meta: cloneGraphValue(metaValue),
      },
    },
    { causedBy: context.hooks?.causedBy },
  );
  context.markMutation();
}
