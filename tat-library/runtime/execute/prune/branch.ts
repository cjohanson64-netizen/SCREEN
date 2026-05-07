import type { PruneBranchExprNode } from "../../../ast/nodeTypes.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";
import { removeBranch } from "../../graph/graph.js";

export function executePruneBranchAction(
  step: PruneBranchExprNode,
  context: ActionPipelineDirectiveContext,
): void {
  const metadataValue = step.metadata ? context.evaluateValue(step.metadata) : null;
  if (metadataValue !== null && !context.isRecord(metadataValue)) {
    throw new Error("@prune.branch metadata must evaluate to an object");
  }

  removeBranch(
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
