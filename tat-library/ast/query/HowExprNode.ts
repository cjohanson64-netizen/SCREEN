import type { BaseNode } from "../core/BaseNode.js";
import type { WhyTargetNode } from "./WhyExprNode.js";

export interface HowExprNode extends BaseNode {
  type: "HowExpr";
  target: WhyTargetNode;
}
