import type { BaseNode } from "../core/BaseNode.js";
import type { GraphQueryExprNode } from "../query/GraphQueryExprNode.js";
import type { RepeatCountExprNode } from "./RepeatCountExprNode.js";
import type { ActionPipelineStepNode } from "./ActionPipelineStepNode.js";

export interface RepeatExprNode extends BaseNode {
  type: "RepeatExpr";
  name: "@repeat";
  until: GraphQueryExprNode | null;
  count: RepeatCountExprNode | null;
  pipeline: ActionPipelineStepNode[];
}
