import type { BaseNode } from "../core/BaseNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";

export interface WherePredicateNode extends BaseNode {
  type: "WherePredicate";
  expression: BooleanExprNode;
}
