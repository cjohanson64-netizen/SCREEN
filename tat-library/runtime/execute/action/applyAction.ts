import type {
  ActionPipelineStepNode,
  NodeCaptureNode,
  PropertyAccessNode,
  ValueExprNode,
} from "../../../ast/nodeTypes.js";
import type { RuntimeAction } from "../../engine/actionRegistry.js";
import { getAction } from "../../engine/actionRegistry.js";
import { addHistoryEntry, type GraphValue } from "../../graph/graph.js";
import { executeAction, type ActionScope } from "../action.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";

export function executeApplyAction(
  mutation: Extract<ActionPipelineStepNode, { type: "ApplyExpr" }>,
  context: ActionPipelineDirectiveContext,
): void {
  const targetValue = evaluateApplyTarget(mutation.target, context);

  if (!isRecord(targetValue) || targetValue.kind !== "traversal") {
    throw new Error(`@action.apply target must resolve to a traversal value`);
  }

  if (!Array.isArray(targetValue.steps)) {
    throw new Error(`@action.apply target must resolve to a traversal value`);
  }

  if (targetValue.steps.length === 0) {
    throw new Error(`@action.apply traversal must contain at least one step`);
  }

  const firstStep = targetValue.steps[0];

  if (!isRecord(firstStep) || typeof firstStep.binding !== "string") {
    throw new Error(`@action.apply traversal step is missing an action binding`);
  }

  if (typeof firstStep.fromRef !== "string") {
    throw new Error(`@action.apply traversal step is missing fromRef`);
  }

  if (typeof firstStep.toRef !== "string") {
    throw new Error(`@action.apply traversal step is missing toRef`);
  }

  const action = getAction(context.actions, firstStep.binding);

  if (!action) {
    throw new Error(`@action.apply could not find action "${firstStep.binding}"`);
  }

  const applyEvent = addHistoryEntry(
    context.graph,
    {
      op: "@action.apply",
      payload: {
        from: firstStep.fromRef,
        action: firstStep.binding,
        to: firstStep.toRef,
      },
    },
    { causedBy: context.hooks?.causedBy },
  );

  executeAction(
    context.graph,
    action,
    { from: firstStep.fromRef, to: firstStep.toRef, payload: context.scope.payload },
    context.actions,
    {
      ...context.hooks,
      causedBy: applyEvent.id,
    },
  );
}

function evaluateApplyTarget(
  target: Extract<ActionPipelineStepNode, { type: "ApplyExpr" }>["target"],
  context: ActionPipelineDirectiveContext,
): GraphValue {
  if (target.type === "Identifier") {
    return context.resolveScopedIdentifier(target.name);
  }

  if (target.shape.type !== "TraversalExpr") {
    throw new Error(`@action.apply target must resolve to a traversal value`);
  }

  return {
    kind: "traversal",
    source: printScopedTraversal(target.shape, context.scope),
    steps: target.shape.segments.map((segment) => {
      const actionSegment =
        segment.type === "ActionSegment" ? segment : segment.segment;
      const binding = actionSegment.operator.name;
      const action = getAction(context.actions, binding);
      const fromRef = resolveTraversalRef(actionSegment.from, context.scope);
      const toRef = resolveTraversalRef(actionSegment.to, context.scope);

      return {
        kind: segment.type === "ActionSegment" ? "action" : "context",
        ...(segment.type === "ContextLift" ? { context: segment.context.name } : {}),
        binding,
        callee: action ? action.bindingName : binding,
        fromRef,
        toRef,
        from: evaluateScopedActionValue(actionSegment.from, context.scope),
        to: evaluateScopedActionValue(actionSegment.to, context.scope),
        action: action ? runtimeActionToValue(action) : null,
      };
    }),
  };
}

function evaluateScopedActionValue(expr: ValueExprNode, scope: ActionScope): GraphValue {
  switch (expr.type) {
    case "Identifier":
      return resolveScopedIdentifier(expr.name, scope);
    case "StringLiteral":
      return expr.value;
    case "NumberLiteral":
      return expr.value;
    case "BooleanLiteral":
      return expr.value;
    case "PropertyAccess":
      return printPropertyAccess(expr);
    case "RuntimeGenerateNodeIdExpr":
      return `@runtime.generateNodeId(${expr.prefix?.raw ?? ""})`;
    case "RuntimeGenerateValueIdExpr":
      return `@runtime.generateValueId(${expr.prefix?.raw ?? ""})`;
    case "RuntimeNextOrderExpr":
      return "@runtime.nextOrder()";
    case "NodeCapture":
      return printNodeCapture(expr);
    case "ObjectLiteral": {
      const out: Record<string, GraphValue> = {};
      for (const prop of expr.properties) {
        out[prop.key] = evaluateScopedActionValue(prop.value, scope);
      }
      return out;
    }
    case "ArrayLiteral":
      return expr.elements.map((item) => evaluateScopedActionValue(item, scope));
    case "WhereExpr":
      throw new Error(`@where is not supported inside @action.apply traversal values`);
    case "ChooseExpr":
    case "DirectiveCallExpr":
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
    case "CurrentValue":
    case "PreviousValue":
      throw new Error(`Unsupported traversal value "${expr.type}"`);
    default:
      return exhaustiveNever(expr);
  }
}

function resolveTraversalRef(expr: ValueExprNode, scope: ActionScope): string | null {
  if (expr.type === "Identifier") {
    return resolveScopedIdentifier(expr.name, scope);
  }

  return null;
}

function printScopedTraversal(
  expr: NodeCaptureNode["shape"] & { type: "TraversalExpr" },
  scope: ActionScope,
): string {
  return expr.segments
    .map((segment) => {
      const actionSegment =
        segment.type === "ActionSegment" ? segment : segment.segment;
      const chunk = `${printScopedTraversalValue(actionSegment.from, scope)}.${actionSegment.operator.name}.${printScopedTraversalValue(actionSegment.to, scope)}`;

      if (segment.type === "ContextLift") {
        return `..${segment.context.name}..${chunk}`;
      }

      return chunk;
    })
    .join("");
}

function printPropertyAccess(expr: PropertyAccessNode): string {
  return `${expr.object.name}.${expr.chain.map((part) => part.name).join(".")}`;
}

function printScopedTraversalValue(expr: ValueExprNode, scope: ActionScope): string {
  switch (expr.type) {
    case "Identifier":
      return resolveScopedIdentifier(expr.name, scope);
    case "StringLiteral":
      return expr.raw;
    case "NumberLiteral":
      return expr.raw;
    case "BooleanLiteral":
      return expr.raw;
    case "PropertyAccess":
      return printPropertyAccess(expr);
    case "RuntimeGenerateNodeIdExpr":
      return `@runtime.generateNodeId(${expr.prefix?.raw ?? ""})`;
    case "RuntimeGenerateValueIdExpr":
      return `@runtime.generateValueId(${expr.prefix?.raw ?? ""})`;
    case "RuntimeNextOrderExpr":
      return "@runtime.nextOrder()";
    case "NodeCapture":
      return printNodeCapture(expr);
    case "ObjectLiteral":
      return "<{...}>";
    case "ArrayLiteral":
      return "[...]";
    case "WhereExpr":
      return "@where(...)";
    case "ChooseExpr":
    case "DirectiveCallExpr":
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
    case "CurrentValue":
    case "PreviousValue":
      return `[${expr.type}]`;
    default:
      return exhaustiveNever(expr);
  }
}

function runtimeActionToValue(action: RuntimeAction): GraphValue {
  return {
    bindingName: action.bindingName,
    guard: action.guard ? astNodeToValue(action.guard) : null,
    pipeline: action.pipeline.map((step) => astNodeToValue(step)),
    project: action.project ? astNodeToValue(action.project) : null,
  };
}

function astNodeToValue(node: unknown): GraphValue {
  if (node === null) return null;
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => astNodeToValue(item));
  }
  if (typeof node !== "object") {
    return null;
  }

  const out: Record<string, GraphValue> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "span") continue;
    out[key] = astNodeToValue(value);
  }
  return out;
}

function printNodeCapture(node: NodeCaptureNode): string {
  switch (node.shape.type) {
    case "Identifier":
      return `<${node.shape.name}>`;
    case "StringLiteral":
      return `<${node.shape.raw}>`;
    case "NumberLiteral":
      return `<${node.shape.raw}>`;
    case "BooleanLiteral":
      return `<${node.shape.raw}>`;
    case "ObjectLiteral":
      return "<{...}>";
    case "TraversalExpr":
      return "<traversal>";
    default:
      return exhaustiveNever(node.shape);
  }
}

function resolveScopedIdentifier(name: string, scope: ActionScope): string {
  if (name === "from") return scope.from;
  if (name === "to") {
    if (!scope.to) {
      throw new Error('Action scope is missing "to"');
    }
    return scope.to;
  }
  if (name === "node" && scope.node) {
    const nodeId = scope.node.id;
    if (typeof nodeId === "string") {
      return nodeId;
    }
    throw new Error('Action scope "node" is missing a string id');
  }
  return name;
}

function isRecord(value: GraphValue): value is Record<string, GraphValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exhaustiveNever(value: never): never {
  throw new Error(`Unexpected node shape: ${String(value)}`);
}
