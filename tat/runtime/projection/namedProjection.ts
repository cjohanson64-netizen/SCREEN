import type { ProjectExprNode, ProjectionContractNode, ValueExprNode } from "../../ast/nodeTypes.js";
import type { RuntimeState } from "../executeProgram.js";
import type { Graph, GraphValue } from "../graph.js";
import { cloneGraphValue } from "../graph.js";
import { projectGraphResult } from "../projection.js";
import { getProjectArgument } from "./projectSpec.js";
import { isProjectFormat } from "./projectFormatRules.js";
import { evaluateProjectionValue, asNodeReferenceId } from "./projectionEvaluation.js";

export function executeNamedProjection(
  graph: Graph,
  invocation: ProjectExprNode,
  state: RuntimeState,
): Record<string, GraphValue> {
  const projectionName = invocation.projectionName?.name;
  if (!projectionName) {
    throw new Error("@project named projection is missing a projection name");
  }

  const definition = state.projectionDefinitions.get(projectionName);
  if (!definition) {
    if (isProjectFormat(projectionName)) {
      return projectGraphResult(
        graph,
        {
          ...invocation,
          projectionName: null,
          args: [
            {
              type: "Argument",
              key: { type: "Identifier", name: "format" },
              value: {
                type: "StringLiteral",
                value: projectionName,
                raw: `"${projectionName}"`,
              },
            },
            ...invocation.args,
          ],
        },
        state,
      ) as Record<string, GraphValue>;
    }

    throw new Error(`Unknown projection "${projectionName}"`);
  }

  const focusExpr =
    getProjectArgument(invocation, "focus")?.value ?? definition.focus;
  if (!focusExpr) {
    throw new Error(`Projection "${projectionName}" requires a focus value`);
  }

  const focusNodeId = resolveProjectionFocusNodeId(
    graph,
    focusExpr,
    state,
    new Map(),
  );
  const scope = new Map<string, GraphValue>();
  scope.set("focus", focusNodeId);
  
  const context = {
    graph,
    state,
    scope,
  };

  const output: Record<string, GraphValue> = {};
  for (const property of definition.fields.properties) {
    const value = evaluateProjectionValue(property.value, context);
    output[property.key] = value;
    scope.set(property.key, cloneGraphValue(value));
  }

  validateProjectionContract(definition.contract, output, projectionName);
  return output;
}

function validateProjectionContract(
  contract: ProjectionContractNode | null,
  output: Record<string, GraphValue>,
  projectionName: string,
): void {
  if (!contract) {
    return;
  }

  for (const entry of contract.entries) {
    if (entry.requirement === "required" && !(entry.key in output)) {
      throw new Error(
        `Projection "${projectionName}" is missing required field "${entry.key}"`,
      );
    }
  }
}

function resolveProjectionFocusNodeId(
  graph: Graph,
  expr: ValueExprNode,
  state: RuntimeState,
  scope: Map<string, GraphValue>,
): string {
  const value = evaluateProjectionValue(expr, {
    graph,
    state,
    scope,
  });

  const nodeId = asNodeReferenceId(value);
  if (!nodeId) {
    throw new Error("Projection focus must resolve to exactly one node");
  }

  if (!graph.nodes.has(nodeId)) {
    throw new Error(
      `Projection focus "${nodeId}" does not resolve to a node in the graph`,
    );
  }

  return nodeId;
}
