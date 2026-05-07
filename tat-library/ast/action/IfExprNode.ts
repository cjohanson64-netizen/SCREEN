import type { BaseNode } from "../core/BaseNode.js";
import type { GraphControlExprNode } from "./GraphControlExprNode.js";
import type { GraphPipelineStepNode } from "./GraphPipelineStepNode.js";

export interface IfExprNode extends BaseNode {
  type: "IfExpr";
  name: "@if";
  when: GraphControlExprNode | null;
  then: GraphPipelineStepNode[];
  else: GraphPipelineStepNode[] | null;
}
