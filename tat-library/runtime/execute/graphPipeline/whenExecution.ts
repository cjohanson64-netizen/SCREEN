import type { WhenExprNode } from "../../../ast/nodeTypes.js";
import type { RuntimeState } from "../../engine/runtimeState.js";

export function executeWhenExpr(statement: WhenExprNode, state: RuntimeState): void {
  if (!statement.query) {
    throw new Error("@when requires a query");
  }

  if (!statement.pipeline.length) {
    throw new Error("@when requires a pipeline");
  }

  state.whenTriggers.push({
    id: `when_${state.whenTriggers.length}`,
    query: statement.query,
    pipeline: statement.pipeline,
  });
}

