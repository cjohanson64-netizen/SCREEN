import type { BaseNode } from "../core/BaseNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";

export interface WhereExprNode extends BaseNode {
  type: "WhereExpr";
  expression: BooleanExprNode;
}
