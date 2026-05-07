import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface ValueBindingNode extends BaseNode {
  type: "ValueBinding";
  name: IdentifierNode;
  value: ValueExprNode;
}
