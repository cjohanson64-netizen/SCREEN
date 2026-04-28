import type {
  ProjectExprNode,
} from "../../ast/nodeTypes.js";
import type { RuntimeState } from "../executeProgram.js";
import type { RuntimeBindings } from "../evaluateNodeCapture.js";
import type { ActionRegistry } from "../actionRegistry.js";
import type { Graph, GraphNode, GraphValue } from "../graph.js";
import type { ProjectFormat, ProjectIncludeKey } from "./projectFormatRules.js";

export interface ProjectSpec {
  format: ProjectFormat;
  focus: string;
  include: ProjectIncludeKey[];
  depth: number | null;
}

export interface ProjectFieldContext {
  graph: Graph;
  focus: string;
  bindings: RuntimeBindings;
  actions: ActionRegistry;
}

export interface ResolvedActionCandidate {
  id: string;
  label: string;
  bindingName: string;
  sourceNode: GraphNode | null;
}

export interface MenuPair {
  action: ResolvedActionCandidate;
  target: GraphNode;
}

export interface NormalizedEventRecord {
  id: string;
  step?: number;
  from?: string;
  to?: string;
  raw?: string;
  label: string;
  event?: string;
  target?: GraphValue;
  action?: GraphValue;
  status?: string;
  state?: Record<string, GraphValue>;
  meta?: Record<string, GraphValue>;
}

export interface ProjectionEvaluationContext {
  graph: Graph;
  state: RuntimeState;
  scope: Map<string, GraphValue>;
}

export type ProjectGraphResultState = RuntimeState;
export type ProjectGraphProjection = ProjectExprNode | null;
