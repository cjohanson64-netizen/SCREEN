import type { GraphInteractionDefinitionNode } from "../../../ast/nodeTypes.js";
import {
  executeGraphInteraction,
  graphInteractionFromAst,
  type GraphInteraction,
} from "../../graph/executeGraphInteraction.js";
import type { RuntimeState } from "../../engine/runtimeState.js";

export function executeGraphInteractionDefinition(
  statement: GraphInteractionDefinitionNode,
  state: RuntimeState,
): void {
  const fallbackId = `__interaction_${state.anonymousGraphInteractions.length}`;
  const interaction = graphInteractionFromAst(statement, fallbackId);

  if (statement.name) {
    state.graphInteractions.set(interaction.id, interaction);

    if (statement.effect) {
      executeRegisteredGraphInteraction(interaction, state);
    }

    return;
  }

  state.anonymousGraphInteractions.push(interaction);

  if (statement.effect) {
    executeRegisteredGraphInteraction(interaction, state);
  }
}

function executeRegisteredGraphInteraction(
  interaction: GraphInteraction,
  state: RuntimeState,
): void {
  const result = executeGraphInteraction(interaction, {
    graphs: state.graphs,
    interactionHistory: state.interactionHistory,
  });

  state.graphs = result.workspace.graphs;
  state.interactionHistory = result.workspace.interactionHistory;
}

