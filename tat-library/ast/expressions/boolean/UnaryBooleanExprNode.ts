import type { BaseNode } from "../../core/BaseNode.js";
import type { BooleanExprNode } from "./BooleanExprNode.js";

export interface UnaryBooleanExprNode extends BaseNode {
  type: "UnaryBooleanExpr";
  operator: "!";
  argument: BooleanExprNode;
}
