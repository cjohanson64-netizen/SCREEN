import type { BaseNode } from "../../core/BaseNode.js";
import type { BooleanExprNode } from "./BooleanExprNode.js";

export interface GroupedBooleanExprNode extends BaseNode {
  type: "GroupedBooleanExpr";
  expression: BooleanExprNode;
}
