import type { ProjectionDefNode } from "../../../ast/nodeTypes.js";
import type { RuntimeState } from "../../engine/runtimeState.js";

export function executeProjectionDefinition(
  statement: ProjectionDefNode,
  state: RuntimeState,
): void {
  state.projectionDefinitions.set(statement.name.name, statement);
  state.assetKinds.set(statement.name.name, "projection");
}

