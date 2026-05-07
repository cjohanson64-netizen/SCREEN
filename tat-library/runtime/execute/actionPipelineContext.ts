import type {
  ActionPipelineStepNode,
  ActionProjectExprNode,
  ValueExprNode,
  IdentifierNode,
  RuntimeGenerateNodeIdExprNode,
} from "../../ast/nodeTypes.js";
import type { ActionRegistry } from "../engine/actionRegistry.js";
import type { Graph, GraphNodeContract, GraphValue } from "../graph/graph.js";
import type {
  ActionExecutionHooks,
  ActionScope,
} from "./action.js";

export interface ExtractedRuntimeNodeValue {
  semanticId?: string;
  contract?: GraphNodeContract;
  value: GraphValue;
}

export interface ActionPipelineDirectiveContext {
  graph: Graph;
  scope: ActionScope;
  actions: ActionRegistry;
  hooks?: ActionExecutionHooks;
  executeStep(step: ActionPipelineStepNode): void;
  executePipeline(pipeline: ActionPipelineStepNode[]): void;
  evaluateValue(expr: ActionProjectExprNode | ValueExprNode): GraphValue;
  resolveScopedIdentifier(name: string): string;
  resolveRuntimeAddNodeTarget(node: IdentifierNode | RuntimeGenerateNodeIdExprNode): string;
  extractRuntimeNodeValue(value: GraphValue): ExtractedRuntimeNodeValue;
  cloneNodeContract(contract: GraphNodeContract | undefined): GraphNodeContract | undefined;
  contractToGraphValue(contract: GraphNodeContract): GraphValue;
  isRecord(value: GraphValue): value is Record<string, GraphValue>;
  markMutation(): void;
}
