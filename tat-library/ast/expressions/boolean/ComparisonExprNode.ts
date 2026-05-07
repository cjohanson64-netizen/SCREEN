import type { BaseNode } from "../../core/BaseNode.js";
import type { BooleanValueNode } from "./BooleanValueNode.js";

export interface ComparisonExprNode extends BaseNode {
  type: "ComparisonExpr";
  operator: "==" | "===" | "!=" | "!==" | "<" | "<=" | ">" | ">=";
  left: BooleanValueNode;
  right: BooleanValueNode;
}
