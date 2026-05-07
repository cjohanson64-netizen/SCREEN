import type { QueryStatementNode, SystemRelationNode } from "../../../ast/nodeTypes.js";
import { executeQuery } from "../../query/executeQuery.js";
import type { RuntimeState } from "../../engine/runtimeState.js";
import { createQueryWorkspace, getCurrentGraph } from "../../engine/runtimeContext.js";

export function executeSystemRelation(
  statement: SystemRelationNode,
  state: RuntimeState,
): void {
  const left = statement.left.name;
  const right = statement.right.name;

  if (!state.graphs.has(left)) {
    throw new Error(`System relation references unknown graph "${left}"`);
  }

  if (!state.graphs.has(right)) {
    throw new Error(`System relation references unknown graph "${right}"`);
  }

  state.systemRelations.push({
    left,
    relation: statement.relation ? statement.relation.value : null,
    right,
  });
}

export function executeQueryStatement(
  statement: QueryStatementNode,
  state: RuntimeState,
): void {
  let graph = getCurrentGraph(state);
  let graphName = state.lastGraphName ?? "seed";

  if (!graph) {
    throw new Error(
      `Cannot execute query before @seed or any graph pipeline has run`,
    );
  }

  const result = executeQuery(
    graph,
    statement.expr,
    state.bindings,
    state.actions,
    createQueryWorkspace(state),
  );

  state.queries.push(statement);
  state.queryResults.push({
    query: statement,
    graphName,
    result,
  });
}

