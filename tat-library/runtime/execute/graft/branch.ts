import type { GraftBranchExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { addBranch } from "../../graph/graph.js";

export function executeGraftBranchAction(
  step: GraftBranchExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  const metadataValue = step.metadata ? context.evaluateValue(step.metadata) : null;
  if (metadataValue !== null && !context.isRecord(metadataValue)) {
    throw new Error("@graft.branch metadata must evaluate to an object");
  }

  addBranch(
    context.graph,
    context.resolveScopedIdentifier(step.subject.name),
    step.relation.value,
    context.resolveScopedIdentifier(step.object.name),
    {
      causedBy: context.hooks?.causedBy,
      metadata: metadataValue ?? undefined,
    },
  );
  context.markMutation();
}
