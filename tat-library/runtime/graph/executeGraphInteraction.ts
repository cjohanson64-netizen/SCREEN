import type {
  DeriveExprNode,
  GraphPipelineStepNode,
  GraphInteractionDefinitionNode,
  ValueExprNode,
} from "../../ast/nodeTypes.js";
import {
  cloneGraph,
  cloneGraphValue,
  removeNodeMeta,
  removeNodeState,
  setNodeMeta,
  setNodeState,
  type Graph,
  type GraphHistoryEntry,
  type GraphValue,
} from "./graph.js";

export type InteractionTarget = "root" | string;

export type DeriveExpression =
  | { kind: "current" }
  | { kind: "previous" }
  | { kind: "literal"; value: GraphValue }
  | {
      kind: "binary";
      operator: "+" | "-" | "*" | "/" | "%";
      left: DeriveExpression;
      right: DeriveExpression;
    };

export type EffectOp =
  | { op: "@graft.state"; node: string; key: string; value: GraphValue }
  | { op: "@graft.meta"; node: string; key: string; value: GraphValue }
  | { op: "@prune.state"; node: string; key: string }
  | { op: "@prune.meta"; node: string; key: string }
  | { op: "@derive.state"; key: string; expression: DeriveExpression }
  | { op: "@derive.meta"; key: string; expression: DeriveExpression };

export type GraphBridge =
  | {
      type: "implicit";
    }
  | {
      type: "explicit";
      ctx: string;
    };

export type GraphInteraction = {
  id: string;

  sourceGraphId: string;
  bridge: GraphBridge;
  targetGraphId: string;
  through: string;
  when?: GraphInteractionDefinitionNode["when"];

  effect: {
    ops: EffectOp[];
  };
};

export type GraphWorkspace = {
  graphs: Map<string, Graph>;
  interactionHistory: GraphInteractionHistoryEntry[];
};

export type GraphInteractionSummary = {
  label?: string;
  effects?: Array<{
    op: EffectOp["op"];
    key?: string;
  }>;
};

export type GraphInteractionHistoryEntry = {
  id: string;
  op: "@interaction";

  through: string;
  definitionId: string;

  sourceGraphId: string;
  bridge: GraphBridge;
  targetGraphId: string;

  targetNodeId: string;
  effectEntryIds: string[];
  summary?: GraphInteractionSummary;
  startedAt: number;
};

export type InteractionLogEntry = {
  sourceGraphId: string;
  bridge: GraphBridge;
  targetGraphId: string;
  through: string;

  targetNodeId: string;
  op: string;
  payload: Record<string, unknown>;
};

type EffectLayer = "state" | "meta";

type DeriveEvaluation = {
  value: GraphValue | undefined;
  containsCurrent: boolean;
};

export function graphInteractionFromAst(
  node: GraphInteractionDefinitionNode,
  fallbackId = "__interaction__",
): GraphInteraction {
  return {
    id: node.name?.name ?? fallbackId,

    sourceGraphId: node.source.graphId.name,
    bridge: materializeGraphBridge(node.bridge),
    targetGraphId: node.target.graphId.name,
    through: node.through.name,
    when: node.when,

    effect: node.effect
      ? {
          ops: node.effect.pipeline.map(materializeEffectOp),
        }
      : {
          ops: [],
        },
  };
}

function materializeGraphBridge(
  bridge: GraphInteractionDefinitionNode["bridge"],
): GraphBridge {
  switch (bridge.type) {
    case "ImplicitGraphBridge":
      return {
        type: "implicit",
      };

    case "ExplicitGraphBridge":
      return {
        type: "explicit",
        ctx: getCtxBridgeName(bridge.ctx),
      };
  }
}

function getCtxBridgeName(
  ctx: GraphInteractionDefinitionNode["bridge"] extends infer Bridge
    ? Bridge extends { type: "ExplicitGraphBridge"; ctx: infer Ctx }
      ? Ctx
      : never
    : never,
): string {
  const firstArg = ctx.args[0]?.value;

  if (!firstArg || firstArg.type !== "Identifier") {
    return "unknown";
  }

  return firstArg.name;
}

export function executeGraphInteraction(
  interaction: GraphInteraction,
  workspace: GraphWorkspace,
): {
  workspace: GraphWorkspace;
  changedGraphIds: string[];
  log: InteractionLogEntry[];
} {
  const originalGraph = workspace.graphs.get(interaction.targetGraphId);
  if (!originalGraph) {
    throw new Error(`Missing graph "${interaction.targetGraphId}"`);
  }

  const interactionEventId = makeInteractionEventId();
  const startedAt = Date.now();
  const graph = cloneGraph(originalGraph);
  const targetNodeId = resolveTargetNodeId(interaction, graph);
  assertGraphBridge(interaction, graph);
  assertGraphHook(interaction, graph);
  assertGraphWhen(interaction);

  if (!graph.nodes.has(targetNodeId)) {
    throw new Error(
      `Missing target node "${targetNodeId}" in graph "${interaction.targetGraphId}"`,
    );
  }

  const log: InteractionLogEntry[] = [];
  const effectEntryIds: string[] = [];

  for (const op of interaction.effect.ops) {
    const historyStart = graph.history.length;
    const opTargetNodeId = resolveEffectOpTargetNodeId(op, targetNodeId, graph);
    const baseline = snapshotNodeLayers(graph, opTargetNodeId);

    switch (op.op) {
      case "@graft.state":
        setNodeState(graph, opTargetNodeId, op.key, op.value, {
          causedBy: interactionEventId,
        });
        break;

      case "@graft.meta":
        setNodeMeta(graph, opTargetNodeId, op.key, op.value, {
          causedBy: interactionEventId,
        });
        break;

      case "@prune.state":
        removeNodeState(graph, opTargetNodeId, op.key, {
          causedBy: interactionEventId,
        });
        break;

      case "@prune.meta":
        removeNodeMeta(graph, opTargetNodeId, op.key, {
          causedBy: interactionEventId,
        });
        break;

      case "@derive.state": {
        const value = evaluateDerivedValue(
          op.expression,
          "state",
          op.key,
          graph,
          opTargetNodeId,
          baseline,
        );
        setNodeState(graph, opTargetNodeId, op.key, value, {
          causedBy: interactionEventId,
          historyOp: "@derive.state",
        });
        break;
      }

      case "@derive.meta": {
        const value = evaluateDerivedValue(
          op.expression,
          "meta",
          op.key,
          graph,
          opTargetNodeId,
          baseline,
        );
        setNodeMeta(graph, opTargetNodeId, op.key, value, {
          causedBy: interactionEventId,
          historyOp: "@derive.meta",
        });
        break;
      }
    }

    effectEntryIds.push(
      ...graph.history
        .slice(historyStart)
        .map((entry: GraphHistoryEntry) => entry.id),
    );

    log.push({
      sourceGraphId: interaction.sourceGraphId,
      bridge: interaction.bridge,
      targetGraphId: interaction.targetGraphId,
      through: interaction.through,
      targetNodeId: opTargetNodeId,
      op: op.op,
      payload: effectLogPayload(op),
    });
  }

  const graphs = new Map(workspace.graphs);
  graphs.set(interaction.targetGraphId, graph);
  const interactionEvent: GraphInteractionHistoryEntry = {
    id: interactionEventId,
    op: "@interaction",

    through: interaction.through,
    definitionId: interaction.id,

    sourceGraphId: interaction.sourceGraphId,
    bridge: interaction.bridge,
    targetGraphId: interaction.targetGraphId,

    targetNodeId,
    effectEntryIds,
    summary: buildInteractionSummary(interaction),
    startedAt,
  };
  const interactionHistory = [
    ...workspace.interactionHistory,
    interactionEvent,
  ];

  return {
    workspace: { graphs, interactionHistory },
    changedGraphIds: [interaction.targetGraphId],
    log,
  };
}

function materializeEffectOp(node: GraphPipelineStepNode): EffectOp {
  switch (node.type) {
    case "GraftStateExpr":
      return {
        op: "@graft.state",
        node: node.node.name,
        key: node.key.value,
        value: materializeLiteralValue(node.value),
      };

    case "GraftMetaExpr":
      return {
        op: "@graft.meta",
        node: node.node.name,
        key: node.key.value,
        value: materializeLiteralValue(node.value),
      };

    case "PruneStateExpr":
      return {
        op: "@prune.state",
        node: node.node.name,
        key: node.key.value,
      };

    case "PruneMetaExpr":
      return {
        op: "@prune.meta",
        node: node.node.name,
        key: node.key.value,
      };

    default:
      throw new Error(`Unsupported @effect pipeline step "${node.type}"`);
  }
}

function materializeLiteralValue(node: ValueExprNode): GraphValue {
  switch (node.type) {
    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
      return node.value;

    case "ObjectLiteral": {
      const out: Record<string, GraphValue> = {};
      for (const property of node.properties) {
        out[property.key] = materializeLiteralValue(property.value);
      }
      return out;
    }

    case "ArrayLiteral":
      return node.elements.map((element) => materializeLiteralValue(element));

    case "ComputeAbsExpr": {
      if (!node.value) {
        throw new Error("@compute.abs requires a value expression");
      }
      const value = materializeLiteralValue(node.value as ValueExprNode);
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("@compute.abs requires a numeric value");
      }
      return Math.abs(value);
    }

    default:
      throw new Error(`Unsupported value in @effect op: ${node.type}`);
  }
}

function materializeDeriveExpr(node: DeriveExprNode): DeriveExpression {
  switch (node.type) {
    case "CurrentValue":
      return { kind: "current" };
    case "PreviousValue":
      return { kind: "previous" };
    case "NumberLiteral":
    case "StringLiteral":
      return { kind: "literal", value: node.value };
    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "DerivePathExpr":
      throw new Error(
        `${node.name} is not supported inside @effect derive expressions`,
      );
    case "DeriveBinaryExpr":
      return {
        kind: "binary",
        operator: node.operator,
        left: materializeDeriveExpr(node.left),
        right: materializeDeriveExpr(node.right),
      };
  }

  throw new Error(
    `Unsupported derive expression "${(node as DeriveExprNode).type}"`,
  );
}

function resolveTargetNodeId(
  interaction: GraphInteraction,
  graph: Graph,
): string {
  if (graph.root && graph.nodes.has(graph.root)) return graph.root;
  if (graph.nodes.has(interaction.through)) return interaction.through;
  throw new Error(
    `Missing target node root/through in graph "${interaction.targetGraphId}"`,
  );
}

function resolveEffectOpTargetNodeId(
  op: EffectOp,
  fallbackTargetNodeId: string,
  graph: Graph,
): string {
  const explicitNode = "node" in op ? op.node : null;

  if (!explicitNode) {
    return fallbackTargetNodeId;
  }

  if (explicitNode === "root" && graph.root && graph.nodes.has(graph.root)) {
    return graph.root;
  }

  if (!graph.nodes.has(explicitNode)) {
    throw new Error(`Missing effect target node "${explicitNode}"`);
  }

  return explicitNode;
}

function snapshotNodeLayers(
  graph: Graph,
  nodeId: string,
): {
  state: Record<string, GraphValue>;
  meta: Record<string, GraphValue>;
} {
  const node = graph.nodes.get(nodeId);

  if (!node) {
    throw new Error(`Missing target node "${nodeId}"`);
  }

  return {
    state: Object.fromEntries(
      Object.entries(node.state).map(([key, value]) => [
        key,
        cloneGraphValue(value),
      ]),
    ) as Record<string, GraphValue>,
    meta: Object.fromEntries(
      Object.entries(node.meta).map(([key, value]) => [
        key,
        cloneGraphValue(value),
      ]),
    ) as Record<string, GraphValue>,
  };
}

function assertGraphBridge(interaction: GraphInteraction, graph: Graph): void {
  if (interaction.bridge.type === "implicit") {
    return;
  }

  if (!graph.nodes.has(interaction.bridge.ctx)) {
    throw new Error(
      `Graph "${interaction.targetGraphId}" does not contain ctx node "${interaction.bridge.ctx}"`,
    );
  }
}

function assertGraphHook(interaction: GraphInteraction, graph: Graph): void {
  if (!graph.nodes.has(interaction.through)) {
    throw new Error(
      `Graph "${interaction.targetGraphId}" does not contain hook node "${interaction.through}"`,
    );
  }
}

function assertGraphWhen(interaction: GraphInteraction): void {
  if (!interaction.when) {
    return;
  }

  // Placeholder for Phase 1.
  // The parser/AST now carries the condition. A later pass should evaluate
  // this through the graph-control/query runtime instead of ignoring it.
}

function evaluateDerivedValue(
  expression: DeriveExpression,
  layer: EffectLayer,
  key: string,
  graph: Graph,
  nodeId: string,
  baseline: {
    state: Record<string, GraphValue>;
    meta: Record<string, GraphValue>;
  },
): GraphValue {
  const result = evaluateDeriveExpression(
    expression,
    layer,
    key,
    graph,
    nodeId,
    baseline,
  );

  if (result.value === undefined) {
    throw new Error(`Derived value for ${layer}.${key} resolved to missing`);
  }

  return result.value;
}

function evaluateDeriveExpression(
  expression: DeriveExpression,
  layer: EffectLayer,
  key: string,
  graph: Graph,
  nodeId: string,
  baseline: {
    state: Record<string, GraphValue>;
    meta: Record<string, GraphValue>;
  },
): DeriveEvaluation {
  switch (expression.kind) {
    case "current":
      return {
        value: readNodeLayerValue(graph, nodeId, layer, key),
        containsCurrent: true,
      };

    case "previous":
      return {
        value: readBaselineValue(baseline, layer, key),
        containsCurrent: false,
      };

    case "literal":
      return {
        value: cloneGraphValue(expression.value),
        containsCurrent: false,
      };

    case "binary": {
      const left = evaluateDeriveExpression(
        expression.left,
        layer,
        key,
        graph,
        nodeId,
        baseline,
      );
      const right = evaluateDeriveExpression(
        expression.right,
        layer,
        key,
        graph,
        nodeId,
        baseline,
      );

      switch (expression.operator) {
        case "+":
          if (
            typeof left.value === "number" &&
            typeof right.value === "number"
          ) {
            return {
              value: left.value + right.value,
              containsCurrent: left.containsCurrent || right.containsCurrent,
            };
          }

          if (
            (left.containsCurrent &&
              left.value === undefined &&
              typeof right.value === "number") ||
            (right.containsCurrent &&
              right.value === undefined &&
              typeof left.value === "number")
          ) {
            throw new Error(
              `Missing current for numeric derive on ${layer}.${key}`,
            );
          }

          return {
            value: appendGraphValues(left.value, right.value),
            containsCurrent: left.containsCurrent || right.containsCurrent,
          };

        case "-":
        case "*":
        case "/":
        case "%":
          return {
            value: evaluateNumericBinary(
              expression.operator,
              left,
              right,
              layer,
              key,
            ),
            containsCurrent: left.containsCurrent || right.containsCurrent,
          };
      }
    }
  }

  return exhaustiveNever(expression);
}

function readNodeLayerValue(
  graph: Graph,
  nodeId: string,
  layer: EffectLayer,
  key: string,
): GraphValue | undefined {
  const node = graph.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Missing target node "${nodeId}"`);
  }

  return layer === "state" ? node.state[key] : node.meta[key];
}

function readBaselineValue(
  baseline: {
    state: Record<string, GraphValue>;
    meta: Record<string, GraphValue>;
  },
  layer: EffectLayer,
  key: string,
): GraphValue | undefined {
  const record = layer === "state" ? baseline.state : baseline.meta;
  return Object.prototype.hasOwnProperty.call(record, key)
    ? record[key]
    : undefined;
}

function evaluateNumericBinary(
  operator: "-" | "*" | "/" | "%",
  left: DeriveEvaluation,
  right: DeriveEvaluation,
  layer: EffectLayer,
  key: string,
): GraphValue {
  if (left.value === undefined || right.value === undefined) {
    if (left.containsCurrent || right.containsCurrent) {
      throw new Error(`Missing current for numeric derive on ${layer}.${key}`);
    }

    throw new Error(`Incompatible numeric derive on ${layer}.${key}`);
  }

  if (typeof left.value !== "number" || typeof right.value !== "number") {
    throw new Error(`Incompatible numeric derive on ${layer}.${key}`);
  }

  switch (operator) {
    case "-":
      return left.value - right.value;
    case "*":
      return left.value * right.value;
    case "/":
      return left.value / right.value;
    case "%":
      return left.value % right.value;
  }
}

function appendGraphValues(
  left: GraphValue | undefined,
  right: GraphValue | undefined,
): GraphValue {
  if (right === undefined) {
    throw new Error(`Cannot append missing value in @derive`);
  }

  const rightClone = cloneGraphValue(right);

  if (left === undefined) {
    return [rightClone];
  }

  if (Array.isArray(left)) {
    return [...left.map((item) => cloneGraphValue(item)), rightClone];
  }

  return [cloneGraphValue(left), rightClone];
}

function effectLogPayload(op: EffectOp): Record<string, unknown> {
  switch (op.op) {
    case "@graft.state":
    case "@graft.meta":
      return {
        key: op.key,
        value: cloneGraphValue(op.value),
      };

    case "@prune.state":
    case "@prune.meta":
      return {
        key: op.key,
      };

    case "@derive.state":
    case "@derive.meta":
      return {
        key: op.key,
        expression: serializeDeriveExpression(op.expression),
      };
  }
}

function serializeDeriveExpression(expression: DeriveExpression): unknown {
  switch (expression.kind) {
    case "current":
    case "previous":
      return expression.kind;
    case "literal":
      return cloneGraphValue(expression.value);
    case "binary":
      return {
        operator: expression.operator,
        left: serializeDeriveExpression(expression.left),
        right: serializeDeriveExpression(expression.right),
      };
  }
}

function buildInteractionSummary(
  interaction: GraphInteraction,
): GraphInteractionSummary {
  return {
    effects: interaction.effect.ops.map((op) => ({
      op: op.op,
      key: op.key,
    })),
  };
}

function makeInteractionEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function exhaustiveNever(value: never): never {
  throw new Error(`Unhandled derive expression: ${JSON.stringify(value)}`);
}
