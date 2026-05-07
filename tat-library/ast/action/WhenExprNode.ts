import type { BaseNode } from "../core/BaseNode.js";
import type { GraphControlExprNode } from "./GraphControlExprNode.js";
import type { GraphPipelineStepNode } from "./GraphPipelineStepNode.js";

export interface WhenExprNode extends BaseNode {
  type: "WhenExpr";
  name: "@when";
  query: GraphControlExprNode | null;
  pipeline: GraphPipelineStepNode[];
}
