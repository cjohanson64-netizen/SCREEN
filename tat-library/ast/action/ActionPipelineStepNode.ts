import type { GraphPipelineStepNode } from "./GraphPipelineStepNode.js";
import type { RepeatExprNode } from "./RepeatExprNode.js";

export type ActionPipelineStepNode = GraphPipelineStepNode | RepeatExprNode;
