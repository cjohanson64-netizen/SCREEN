import type {
  DirectiveCallExprNode,
  IfValueExprNode,
  ValueExprNode,
} from "../../ast/nodeTypes.js";
import type { RuntimeBindings } from "../evaluateNodeCapture.js";
import type { GraphValue } from "../graph.js";
import { cloneGraphValue, getIncomingEdges, getOutgoingEdges } from "../graph.js";
import { evaluateValueExpr } from "../evaluateNodeCapture.js";
import {
  evaluateDeriveExpr,
  evaluateGraphControlExpr,
} from "../evaluateGraphControl.js";
import type { ProjectionEvaluationContext } from "./projectTypes.js";
import { exhaustiveNever, isRecord, projectNodeReference } from "./projectionUtils.js";

export function evaluateProjectionValue(
  expr: ValueExprNode,
  context: ProjectionEvaluationContext,
): GraphValue {
  switch (expr.type) {
    case "Identifier":
      return resolveProjectionIdentifier(expr.name, context);

    case "PropertyAccess":
      return resolveProjectionPropertyAccess(
        expr.object.name,
        expr.chain.map((part) => part.name),
        context,
      );

    case "StringLiteral":
      return expr.value;

    case "NumberLiteral":
      return expr.value;

    case "BooleanLiteral":
      return expr.value;

    case "ObjectLiteral": {
      const out: Record<string, GraphValue> = {};
      for (const property of expr.properties) {
        out[property.key] = evaluateProjectionValue(property.value, context);
      }
      return out;
    }

    case "ArrayLiteral":
      return expr.elements.map((element) =>
        evaluateProjectionValue(element, context),
      );

    case "DirectiveCallExpr":
      return evaluateProjectionDirective(expr, context);

    case "IfValueExpr":
      return evaluateProjectionIf(expr, context);

    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "DeriveCountExpr":
    case "DeriveEdgeCountExpr":
    case "DeriveExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "DeriveSumExpr":
    case "DeriveMinExpr":
    case "DeriveMaxExpr":
    case "DeriveAvgExpr":
    case "DeriveAbsExpr":
    case "DeriveBinaryExpr":
      return evaluateDeriveExpr(context.graph, expr, {
        bindings: createProjectionBindings(context),
      });
    case "CurrentValue":
    case "PreviousValue":
      throw new Error(`Unsupported projection expression "${expr.type}"`);

    case "RuntimeGenerateNodeIdExpr":
      return `@runtime.generateNodeId(${expr.prefix?.raw ?? ""})`;

    case "RuntimeGenerateValueIdExpr":
      return `@runtime.generateValueId(${expr.prefix?.raw ?? ""})`;

    case "RuntimeNextOrderExpr":
      return "@runtime.nextOrder()";

    case "NodeCapture":
      return evaluateValueExpr(
        expr,
        createProjectionBindings(context),
        context.state.actions,
      );

    case "WhereExpr":
      throw new Error("@where is not supported inside projection fields");

    default:
      return exhaustiveNever(expr);
  }
}

function evaluateProjectionIf(
  expr: IfValueExprNode,
  context: ProjectionEvaluationContext,
): GraphValue {
  if (!expr.when) {
    throw new Error("@if requires a when clause");
  }
  if (!expr.then) {
    throw new Error("@if requires a then value");
  }

  const result = evaluateGraphControlExpr(context.graph, expr.when, {
    bindings: createProjectionBindings(context),
    actions: context.state.actions,
  });

  if (result) {
    return evaluateProjectionValue(expr.then, context);
  }

  if (!expr.else) {
    return null;
  }

  return evaluateProjectionValue(expr.else, context);
}

function evaluateProjectionDirective(
  expr: DirectiveCallExprNode,
  context: ProjectionEvaluationContext,
): GraphValue {
  switch (expr.name) {
    case "@select.node": {
      assertDirectiveArgCount(expr, 1);
      const nodeId = requireNodeReference(
        evaluateProjectionValue(expr.args[0]!.value, context),
        expr.name,
      );
      return nodeId;
    }

    case "@select.targets": {
      assertDirectiveArgCount(expr, 2);
      const nodeId = requireNodeReference(
        evaluateProjectionValue(expr.args[0]!.value, context),
        expr.name,
      );
      const relation = requireStringValue(
        evaluateProjectionValue(expr.args[1]!.value, context),
        `${expr.name} relation`,
      );
      return getOutgoingEdges(context.graph, nodeId)
        .filter((edge) => edge.relation === relation)
        .map((edge) => edge.object);
    }

    case "@select.sources": {
      assertDirectiveArgCount(expr, 2);
      const nodeId = requireNodeReference(
        evaluateProjectionValue(expr.args[0]!.value, context),
        expr.name,
      );
      const relation = requireStringValue(
        evaluateProjectionValue(expr.args[1]!.value, context),
        `${expr.name} relation`,
      );
      return getIncomingEdges(context.graph, nodeId)
        .filter((edge) => edge.relation === relation)
        .map((edge) => edge.subject);
    }

    case "@select.first": {
      assertDirectiveArgCount(expr, 1);
      const value = evaluateProjectionValue(expr.args[0]!.value, context);
      if (!Array.isArray(value)) {
        throw new Error(`${expr.name} requires an array argument`);
      }
      return value.length > 0 ? cloneGraphValue(value[0]!) : null;
    }

    case "@select.one": {
      assertDirectiveArgCount(expr, 1);
      const value = evaluateProjectionValue(expr.args[0]!.value, context);
      if (!Array.isArray(value)) {
        throw new Error(`${expr.name} requires an array argument`);
      }
      if (value.length !== 1) {
        throw new Error(
          `${expr.name} requires exactly one item but received ${value.length}`,
        );
      }
      return cloneGraphValue(value[0]!);
    }

    default:
      throw new Error(`Unknown directive "${expr.name}"`);
  }
}

function resolveProjectionIdentifier(
  name: string,
  context: ProjectionEvaluationContext,
): GraphValue {
  if (context.scope.has(name)) {
    return cloneGraphValue(context.scope.get(name)!);
  }

  if (context.state.bindings.nodes.has(name)) {
    return projectNodeReference(context.state.bindings.nodes.get(name)!);
  }

  if (context.state.bindings.values.has(name)) {
    return cloneGraphValue(context.state.bindings.values.get(name)!);
  }

  throw new Error(`Undefined projection binding "${name}"`);
}

function resolveProjectionPropertyAccess(
  objectName: string,
  chain: string[],
  context: ProjectionEvaluationContext,
): GraphValue {
  const base = resolveProjectionIdentifier(objectName, context);
  if (!isRecord(base)) {
    return null;
  }
  return digProjectionValue(base, chain);
}

export function createProjectionBindings(
  context: ProjectionEvaluationContext,
): RuntimeBindings {
  const bindings: RuntimeBindings = {
    values: new Map(context.state.bindings.values),
    nodes: new Map(context.state.bindings.nodes),
  };

  for (const [key, value] of context.scope.entries()) {
    bindings.values.set(key, cloneGraphValue(value));
  }

  return bindings;
}

export function asNodeReferenceId(value: GraphValue): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value) && typeof value.id === "string") {
    return value.id;
  }

  return null;
}

function requireNodeReference(value: GraphValue, opName: string): string {
  const nodeId = asNodeReferenceId(value);
  if (!nodeId) {
    throw new Error(`${opName} requires a node reference`);
  }
  return nodeId;
}

function requireStringValue(value: GraphValue, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must resolve to a string`);
  }
  return value;
}

function assertDirectiveArgCount(
  expr: DirectiveCallExprNode,
  expected: number,
): void {
  if (expr.args.length !== expected) {
    throw new Error(
      `${expr.name} expects ${expected} argument${expected === 1 ? "" : "s"}`,
    );
  }
}

function digProjectionValue(value: GraphValue, path: string[]): GraphValue {
  let current: GraphValue = value;
  for (const part of path) {
    if (!isRecord(current) || !(part in current)) {
      return null;
    }
    current = current[part]!;
  }
  return cloneGraphValue(current);
}
