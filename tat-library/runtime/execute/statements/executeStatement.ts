import type { ExportDeclarationNode, StatementNode, TopLevelInjectionStatementNode } from "../../../ast/nodeTypes.js";
import type { RuntimeState } from "../../engine/runtimeState.js";
import { ensureProjectNotTerminal } from "../../engine/runtimeContext.js";
import { buildSeedGraph } from "../seed/seedGraph.js";
import { executeValueBinding, executeValueDefinition, executeBindStatement, executeOperatorBinding } from "./bindingsExecution.js";
import { executeProjectionDefinition } from "./projectionDefinition.js";
import { executeGraphPipeline, executeWhenExpr } from "../graphPipeline/graphPipelineExecution.js";
import { executeGraphProjection } from "../projection/projectionExecution.js";
import { executeGraphInteractionDefinition } from "../graphPipeline/graphInteractionExecution.js";
import { executeSystemRelation, executeQueryStatement } from "./systemQueryExecution.js";
import {
  recordInjectionHistory,
  resolveParseValidateTopLevelInjection,
} from "../graphPipeline/injectionExecution.js";
import { measureTiming } from "../../instrumentation/timing.js";

export function executeStatement(statement: StatementNode, state: RuntimeState): void {
  switch (statement.type) {
    case "ImportDeclaration":
    case "ExportDeclaration":
      return;
    case "TopLevelInjectionStatement":
      executeTopLevelInjectionStatement(statement, state);
      return;
    case "ValueBinding":
      executeValueBinding(statement, state);
      return;
    case "ValueDef":
      executeValueDefinition(statement, state);
      return;
    case "BindStatement":
      ensureProjectNotTerminal(state, "@bind");
      executeBindStatement(statement, state);
      return;
    case "OperatorBinding":
      executeOperatorBinding(statement, state);
      return;
    case "ProjectionDef":
      executeProjectionDefinition(statement, state);
      return;
    case "SeedBlock":
      state.seed = statement;
      state.seedGraph = buildSeedGraph(statement, state.bindings);
      return;
    case "GraphPipeline":
      executeGraphPipeline(statement, state);
      return;
    case "GraphProjection":
      executeGraphProjection(statement, state);
      return;
    case "WhenExpr":
      executeWhenExpr(statement, state);
      return;
    case "GraphInteractionDefinition":
      executeGraphInteractionDefinition(statement, state);
      return;
    case "SystemRelation":
      executeSystemRelation(statement, state);
      return;
    case "QueryStatement":
      executeQueryStatement(statement, state);
      return;
    default: {
      const _exhaustive: never = statement;
      throw new Error(`Unsupported statement type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function executeTopLevelInjectionStatement(
  statement: TopLevelInjectionStatementNode,
  state: RuntimeState,
): void {
  let payload = state.injections[statement.inject.hookRef.name];

  try {
    const resolved = resolveParseValidateTopLevelInjection(statement, state);
    payload = resolved.payload;

    measureTiming(state.timing, "inject.topLevel.execute", () => {
      for (const injectedStatement of resolved.program.body) {
        executeStatement(injectedStatement, state);
      }
    });

    if (statement.inject.alias) {
      bindTopLevelInjectionAlias(statement, resolved.program, state);
    }

    recordInjectionHistory(state, statement.inject, resolved.payload, "top-level", "success", {
      executedStepCount: resolved.program.body.length,
    });
  } catch (error) {
    if (payload) {
      recordInjectionHistory(state, statement.inject, payload, "top-level", "error", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    throw error;
  }
}


function bindTopLevelInjectionAlias(
  statement: TopLevelInjectionStatementNode,
  program: { body: StatementNode[] },
  state: RuntimeState,
): void {
  const alias = statement.inject.alias;
  if (!alias) return;

  const exportedNames = program.body
    .filter((entry): entry is ExportDeclarationNode => entry.type === "ExportDeclaration")
    .flatMap((entry) => entry.specifiers.map((specifier) => specifier.local.name));

  if (exportedNames.length !== 1) {
    throw new Error(
      `Aliased injection "${statement.inject.hookRef.name}" must export exactly one graph-compatible result.`,
    );
  }

  const exportedName = exportedNames[0];
  const graph = state.graphs.get(exportedName);
  if (!graph) {
    throw new Error(
      `Aliased injection "${statement.inject.hookRef.name}" export "${exportedName}" is not a graph-compatible result.`,
    );
  }

  if (state.assetKinds.has(alias.name) || state.graphs.has(alias.name)) {
    throw new Error(`Duplicate module binding "${alias.name}".`);
  }

  state.graphs.set(alias.name, graph);
  state.assetKinds.set(alias.name, "graph");
}
