import type { BindStatementNode, StatementNode, ValueBindingNode, ValueDefNode, ValueExprNode, ObjectLiteralNode, ArrayLiteralNode, ChooseExprNode } from "../../../ast/nodeTypes.js";
import {
  classifyBindValue,
  evaluateBindExpr,
  type BindValue,
} from "../../bind/bindUtils.js";
import type { Graph, GraphNode, GraphValue } from "../../graph/graph.js";
import {
  evaluateNodeCapture,
  evaluateValueExpr,
  registerNodeBinding,
  registerValueBinding,
} from "../../query/evaluateNodeCapture.js";
import { registerAction } from "../../engine/actionRegistry.js";
import { getCurrentGraph, requireCurrentGraph } from "../../engine/runtimeContext.js";
import type { RuntimeState } from "../../engine/runtimeState.js";
import { evaluateGraphControlExpr } from "../../graphControl/controlEvaluator.js";
import { evaluateDeriveExpr } from "../../graphControl/deriveEvaluator.js";


export function executeValueDefinition(
  statement: ValueDefNode,
  state: RuntimeState,
): void {
  const graph = getCurrentGraph(state);
  const values: Record<string, GraphValue> = {};

  for (const entry of statement.entries) {
    values[entry.key] = evaluateSemanticValue(entry.value, state, graph);
  }

  state.valueScopes.set(statement.scopeName.name, values);
  registerValueBinding(state.bindings, statement.scopeName.name, values);
  state.assetKinds.set(statement.scopeName.name, "value");
}

export function evaluateSemanticValue(
  expr: ValueExprNode,
  state: RuntimeState,
  graph: Graph | null = getCurrentGraph(state),
): GraphValue {
  switch ((expr as any).type) {
    case "WhereExpr":
      if (!graph) throw new Error("@where requires a graph context");
      return evaluateGraphControlExpr(graph, (expr as any).expression, {
        bindings: state.bindings,
        actions: state.actions,
      });

    case "GraphQueryExpr":
    case "PathExpr":
      if (!graph) throw new Error(`${expr.type} requires a graph context`);
      return evaluateGraphControlExpr(graph, expr as any, {
        bindings: state.bindings,
        actions: state.actions,
      });

    case "ChooseExpr":
      return evaluateChooseValue(expr as ChooseExprNode, state, graph);

    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "ComputeEdgeCountExpr":
    case "ComputeExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "ComputeSumExpr":
    case "ComputeMinExpr":
    case "ComputeMaxExpr":
    case "ComputeAvgExpr":
    case "ComputeAbsExpr":
    case "DeriveBinaryExpr":
      if (!graph) throw new Error(`${expr.type} requires a graph context`);
      return evaluateDeriveExpr(graph, expr as any, {
        bindings: state.bindings,
        actions: state.actions,
      });

    case "ObjectLiteral":
      return evaluateSemanticObject(expr as ObjectLiteralNode, state, graph);

    case "ArrayLiteral":
      return (expr as ArrayLiteralNode).elements.map((element: ValueExprNode) => evaluateSemanticValue(element, state, graph));

    default:
      return evaluateValueExpr(expr, state.bindings, state.actions);
  }
}

function evaluateSemanticObject(
  object: ObjectLiteralNode,
  state: RuntimeState,
  graph: Graph | null,
): Record<string, GraphValue> {
  const out: Record<string, GraphValue> = {};
  for (const prop of object.properties) {
    out[prop.key] = evaluateSemanticValue(prop.value, state, graph);
  }
  return out;
}

function evaluateChooseValue(
  expr: ChooseExprNode,
  state: RuntimeState,
  graph: Graph | null,
): GraphValue {
  if (!graph) throw new Error("@choose requires a graph context");
  if (!expr.when) return null;
  const branch = evaluateGraphControlExpr(graph, expr.when, {
    bindings: state.bindings,
    actions: state.actions,
  })
    ? expr.then
    : expr.else;

  if (!branch) return null;
  return evaluateSemanticValue(branch, state, graph);
}

export function executeValueBinding(
  statement: ValueBindingNode,
  state: RuntimeState,
): void {
  const name = statement.name.name;

  if (statement.value.type === "NodeCapture") {
    const evaluated = evaluateNodeCapture(
      name,
      statement.value,
      state.bindings,
      state.actions,
    );
    registerNodeBinding(state.bindings, name, evaluated.node);
    state.assetKinds.set(name, "node");
    return;
  }

  const phase7Value = statement.value as any;
  if (
    phase7Value.type === "GraphQueryExpr" ||
    phase7Value.type === "PathExpr" ||
    phase7Value.type === "ChooseExpr"
  ) {
    const value = evaluateBindExpr(
      statement.value,
      state.bindings,
      state.actions,
      getCurrentGraph(state),
    );
    registerValueBinding(state.bindings, name, value as GraphValue);
    state.assetKinds.set(name, "projection");
    return;
  }

  const value = evaluateValueExpr(
    statement.value,
    state.bindings,
    state.actions,
  );
  registerValueBinding(state.bindings, name, value);
}

export function executeBindStatement(
  statement: BindStatementNode,
  state: RuntimeState,
): void {
  const graph = getCurrentGraph(state);
  const value = evaluateBindExpr(
    statement.expression,
    state.bindings,
    state.actions,
    graph,
  );

  if (statement.entity) {
    const kind = classifyBindValue(value);

    if (kind !== "empty" && kind !== statement.entity) {
      throw new Error(
        `@bind.${statement.layer ?? "ctx"}.${statement.entity} expected ${statement.entity} result, got ${kind}`,
      );
    }
  }

  const layer = statement.layer ?? "ctx";

  switch (layer) {
    case "ctx":
      writeBindToContext(state, statement.name.name, value);
      return;

    case "state": {
      const target = requireCurrentGraph(state, "@bind.state");
      target.state[statement.name.name] = deepCloneBindValue(
        value,
      ) as unknown as GraphValue;
      return;
    }

    case "meta": {
      const target = requireCurrentGraph(state, "@bind.meta");
      target.meta[statement.name.name] = deepCloneBindValue(
        value,
      ) as unknown as GraphValue;
      return;
    }

    default: {
      const _exhaustive: never = layer;
      throw new Error(
        `Unsupported @bind layer: ${JSON.stringify(_exhaustive)}`,
      );
    }
  }
}

export function executeOperatorBinding(
  statement: Extract<StatementNode, { type: "OperatorBinding" }>,
  state: RuntimeState,
): void {
  const name = statement.name.name;

  switch (statement.value.type) {
    case "ActionExpr":
      registerAction(state.actions, {
        bindingName: name,
        guard: statement.value.guard,
        pipeline: statement.value.pipeline,
        project: statement.value.project,
      });
      state.assetKinds.set(name, "program");
      return;

    case "CtxExpr":
      return;

    case "ProjectExpr":
      return;

    default: {
      const _exhaustive: never = statement.value;
      throw new Error(
        `Unsupported operator binding type: ${JSON.stringify(_exhaustive)}`,
      );
    }
  }
}

function writeBindToContext(
  state: RuntimeState,
  name: string,
  value: BindValue,
): void {
  if (isGraphNodeLike(value)) {
    registerNodeBinding(state.bindings, name, value);
    return;
  }

  registerValueBinding(
    state.bindings,
    name,
    deepCloneBindValue(value) as GraphValue,
  );
}

function isGraphNodeLike(value: BindValue): value is GraphNode {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as GraphNode).id === "string" &&
    "value" in (value as GraphNode) &&
    "state" in (value as GraphNode) &&
    "meta" in (value as GraphNode)
  );
}

function deepCloneBindValue<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepCloneBindValue(item)) as T;
  }

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = deepCloneBindValue(item);
  }
  return out as T;
}

