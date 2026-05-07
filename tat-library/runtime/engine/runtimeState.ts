import type {
  GraphControlExprNode,
  GraphPipelineStepNode,
  ProjectionDefNode,
  QueryStatementNode,
  SeedBlockNode,
} from "../../ast/nodeTypes.js";
import type { RuntimeBindings } from "../query/evaluateNodeCapture.js";
import { createRuntimeBindings } from "../query/evaluateNodeCapture.js";
import type { ActionRegistry } from "./actionRegistry.js";
import { createActionRegistry } from "./actionRegistry.js";
import type { QueryExecutionResult } from "../query/executeQuery.js";
import type { Graph } from "../graph/graph.js";
import type {
  GraphInteraction,
  GraphInteractionHistoryEntry,
} from "../graph/executeGraphInteraction.js";
import type { RuntimeTimingCollector, RuntimeTimingReport } from "../instrumentation/timing.js";
import type { RuntimeProfiler, RuntimeProfileReport } from "../instrumentation/profiler.js";
import type { RuntimeInjectionFragmentCache } from "../cache/injectionFragmentCache.js";


export interface InjectionPayload {
  fileExtension: string;
  source: string;
}

export type InjectionRegistry = Record<string, InjectionPayload>;

export interface InjectionHistoryEntry {
  id: string;
  op: "@inject";
  hookRef: string;
  fileExtension: string;
  source: string;
  context: "top-level" | "graph-flow";
  status: "success" | "error";
  executedStepCount?: number;
  error?: string;
  startedAt: number;
}

export type RuntimeAssetKind =
  | "node"
  | "fragment"
  | "graph"
  | "projection"
  | "program"
  | "interaction"
  | "value";

export interface ExecutedSystemRelation {
  left: string;
  relation: string | null;
  right: string;
}

export interface ExecutedQuery {
  query: QueryStatementNode;
  graphName: string;
  result: QueryExecutionResult;
}

export interface ReactiveTriggerRegistration {
  id: string;
  query: GraphControlExprNode;
  pipeline: GraphPipelineStepNode[];
}

export interface ReactiveCycleState {
  triggerStates: Map<string, boolean>;
  fireCount: number;
}

export interface RuntimeState {
  bindings: RuntimeBindings;
  actions: ActionRegistry;
  assetKinds: Map<string, RuntimeAssetKind>;
  seed: SeedBlockNode | null;
  seedGraph: Graph | null;
  graphs: Map<string, Graph>;
  graphFocus: Map<string, string>;
  projectionDefinitions: Map<string, ProjectionDefNode>;
  projections: Map<string, unknown>;
  valueScopes: Map<string, Record<string, import("../graph/graph.js").GraphValue>>;
  graphInteractions: Map<string, GraphInteraction>;
  anonymousGraphInteractions: GraphInteraction[];
  interactionHistory: GraphInteractionHistoryEntry[];
  injections: InjectionRegistry;
  injectionHistory: InjectionHistoryEntry[];
  systemRelations: ExecutedSystemRelation[];
  queries: QueryStatementNode[];
  queryResults: ExecutedQuery[];
  whenTriggers: ReactiveTriggerRegistration[];
  lastGraphName: string | null;
  terminalProjectReached: boolean;
  timing?: RuntimeTimingCollector;
  profiler?: RuntimeProfiler;
  injectionFragmentCache?: RuntimeInjectionFragmentCache;
}

export interface ExecuteProgramResult {
  state: RuntimeState;
  timing?: RuntimeTimingReport;
  profile?: RuntimeProfileReport;
}

export interface ExecuteProgramOptions {
  initialState?: Partial<RuntimeState>;
  injections?: InjectionRegistry;
  timing?: boolean;
  timingCollector?: RuntimeTimingCollector;
  profile?: boolean;
  profiler?: RuntimeProfiler;
  injectionFragmentCache?: boolean | RuntimeInjectionFragmentCache;
}

export function createRuntimeState(
  initialState?: Partial<RuntimeState>,
): RuntimeState {
  return {
    bindings: initialState?.bindings ?? createRuntimeBindings(),
    actions: initialState?.actions ?? createActionRegistry(),
    assetKinds: initialState?.assetKinds ?? new Map<string, RuntimeAssetKind>(),
    seed: initialState?.seed ?? null,
    seedGraph: initialState?.seedGraph ?? null,
    graphs: initialState?.graphs ?? new Map<string, Graph>(),
    graphFocus: initialState?.graphFocus ?? new Map<string, string>(),
    projectionDefinitions:
      initialState?.projectionDefinitions ?? new Map<string, ProjectionDefNode>(),
    projections: initialState?.projections ?? new Map<string, unknown>(),
    valueScopes: initialState?.valueScopes ?? new Map<string, Record<string, import("../graph/graph.js").GraphValue>>(),
    graphInteractions:
      initialState?.graphInteractions ?? new Map<string, GraphInteraction>(),
    anonymousGraphInteractions: initialState?.anonymousGraphInteractions ?? [],
    interactionHistory: initialState?.interactionHistory ?? [],
    injections: initialState?.injections ?? {},
    injectionHistory: initialState?.injectionHistory ?? [],
    systemRelations: initialState?.systemRelations ?? [],
    queries: initialState?.queries ?? [],
    queryResults: initialState?.queryResults ?? [],
    whenTriggers: initialState?.whenTriggers ?? [],
    lastGraphName: initialState?.lastGraphName ?? null,
    terminalProjectReached: initialState?.terminalProjectReached ?? false,
    timing: initialState?.timing,
    profiler: initialState?.profiler,
    injectionFragmentCache: initialState?.injectionFragmentCache,
  };
}
