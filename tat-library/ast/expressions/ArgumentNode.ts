import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ValueExprNode } from "./ValueExprNode.js";

export interface ArgumentNode extends BaseNode {
  type: "Argument";
  key: IdentifierNode | null;
  value: ValueExprNode;
}
