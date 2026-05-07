import type {
  ArrayLiteralNode,
  BooleanLiteralNode,
  GraphPipelineNode,
  GraphProjectionNode,
  NumberLiteralNode,
  ObjectLiteralNode,
  ObjectPropertyNode,
  StringLiteralNode,
  ValueExprNode,
} from "../../../ast/nodeTypes.js";
import { projectGraphResult } from "../../projection/projection.js";
import { evaluateValueExpr } from "../../query/evaluateNodeCapture.js";
import type { Graph, GraphValue } from "../../graph/graph.js";
import type { RuntimeProjectionOptions } from "../../engine/runtimeRequests.js";
import type { RuntimeState } from "../../engine/runtimeState.js";

export function withResolvedProjectionFocus(
  projectionName: string,
  graphBinding: string,
  projection: GraphPipelineNode["projection"] | GraphProjectionNode["projection"],
  state: RuntimeState,
  options?: RuntimeProjectionOptions,
) {
  if (!projection) {
    return projection;
  }

  const focusOverrides = options?.focusOverrides;
  const runtimeFocus = state.graphFocus.get(graphBinding) ?? null;
  const fallbackOverride = focusOverrides?.[projectionName] ?? null;
  const resolvedFocus = runtimeFocus ?? fallbackOverride;
  const argumentOverrides = options?.argumentOverrides?.[projectionName] ?? {};

  const nextArgs = projection.args.filter((arg) => {
    const key = arg.key?.name ?? null;
    if (key === "focus" && resolvedFocus) {
      return false;
    }
    if (key && Object.prototype.hasOwnProperty.call(argumentOverrides, key)) {
      return false;
    }
    return true;
  });

  if (resolvedFocus) {
    nextArgs.push({
      type: "Argument",
      key: {
        type: "Identifier",
        name: "focus",
      },
      value: {
        type: "StringLiteral",
        value: resolvedFocus,
        raw: JSON.stringify(resolvedFocus),
      },
    });
  }

  for (const [key, value] of Object.entries(argumentOverrides)) {
    nextArgs.push({
      type: "Argument",
      key: {
        type: "Identifier",
        name: key,
      },
      value: graphValueToValueExpr(value),
    });
  }

  return {
    ...projection,
    args: nextArgs,
  };
}

function graphValueToValueExpr(value: GraphValue): ValueExprNode {
  if (typeof value === "string") {
    const node: StringLiteralNode = {
      type: "StringLiteral",
      value,
      raw: JSON.stringify(value),
    };
    return node;
  }

  if (typeof value === "number") {
    const node: NumberLiteralNode = {
      type: "NumberLiteral",
      value,
      raw: String(value),
    };
    return node;
  }

  if (typeof value === "boolean") {
    const node: BooleanLiteralNode = {
      type: "BooleanLiteral",
      value,
      raw: String(value),
    };
    return node;
  }

  if (Array.isArray(value)) {
    const node: ArrayLiteralNode = {
      type: "ArrayLiteral",
      elements: value.map((item) => graphValueToValueExpr(item)),
    };
    return node;
  }

  if (value && typeof value === "object") {
    const node: ObjectLiteralNode = {
      type: "ObjectLiteral",
      properties: Object.entries(value).map(
        ([key, entryValue]): ObjectPropertyNode => ({
          type: "ObjectProperty",
          key,
          value: graphValueToValueExpr(entryValue),
        }),
      ),
    };
    return node;
  }

  throw new Error("Runtime projection argument overrides do not support null values");
}

export function executeGraphProjection(
  statement: GraphProjectionNode,
  state: RuntimeState,
): void {
  const graphName = statement.source.name;
  const graph = state.graphs.get(graphName);

  if (!graph) {
    throw new Error(
      `${statement.projection.name} source "${graphName}" is not a graph value — ensure it is declared before this projection`,
    );
  }

  initializeGraphFocus(
    state,
    graphName,
    graph,
    statement.projection,
  );
  const result = executeTerminalGraphExpr(
    statement.name.name,
    graph,
    statement.projection,
    state,
    statement.source.name,
  );
  state.projections.set(statement.name.name, result);
  state.assetKinds.set(statement.name.name, "projection");
}

export function executeTerminalGraphExpr(
  _projectionName: string,
  graph: Graph,
  projection: GraphPipelineNode["projection"] | GraphProjectionNode["projection"],
  state: RuntimeState,
  _sourceGraphId?: string,
): unknown {
  return projectGraphResult(graph, projection, state);
}

export function initializeGraphFocus(
  state: RuntimeState,
  graphBinding: string,
  graph: Graph,
  projection: GraphPipelineNode["projection"] | GraphProjectionNode["projection"],
): void {
  if (state.graphFocus.has(graphBinding)) {
    return;
  }

  const initialFocus = resolveInitialGraphFocus(projection, graph, state);
  if (initialFocus) {
    state.graphFocus.set(graphBinding, initialFocus);
  }
}

function resolveInitialGraphFocus(
  projection: GraphPipelineNode["projection"] | GraphProjectionNode["projection"],
  graph: Graph,
  state: RuntimeState,
): string | null {
  const focusArg =
    projection?.args.find((arg) => arg.key?.name === "focus") ?? null;

  const effectiveFocusValue =
    focusArg?.value ??
    (projection?.type === "ProjectExpr" && projection.projectionName
      ? state.projectionDefinitions.get(projection.projectionName.name)?.focus ?? null
      : null);

  if (!effectiveFocusValue) {
    return graph.root;
  }

  if (effectiveFocusValue.type === "Identifier" && state.bindings.nodes.has(effectiveFocusValue.name)) {
    return state.bindings.nodes.get(effectiveFocusValue.name)!.id;
  }

  const value = evaluateValueExpr(effectiveFocusValue, state.bindings, state.actions);
  if (typeof value === "string" && graph.nodes.has(value)) {
    return value;
  }

  return graph.root;
}

