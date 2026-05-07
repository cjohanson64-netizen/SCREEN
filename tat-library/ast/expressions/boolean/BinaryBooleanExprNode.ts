import type { BaseNode } from "../../core/BaseNode.js";
import type { BooleanExprNode } from "./BooleanExprNode.js";

export interface BinaryBooleanExprNode extends BaseNode {
  type: "BinaryBooleanExpr";
  operator: "&&" | "||";
  left: BooleanExprNode;
  right: BooleanExprNode;
}
