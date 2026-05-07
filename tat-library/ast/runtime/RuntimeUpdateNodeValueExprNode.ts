import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface RuntimeUpdateNodeValueExprNode extends BaseNode {
  type: "RuntimeUpdateNodeValueExpr";
  name: "@runtime.updateNodeValue";
  node: IdentifierNode;
  patch: ValueExprNode;
}
