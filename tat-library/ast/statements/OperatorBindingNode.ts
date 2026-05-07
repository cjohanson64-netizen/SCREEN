import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { OperatorExprNode } from "../expressions/OperatorExprNode.js";

export interface OperatorBindingNode extends BaseNode {
  type: "OperatorBinding";
  name: IdentifierNode;
  value: OperatorExprNode;
}
