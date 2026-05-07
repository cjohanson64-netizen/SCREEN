import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface EdgeExprNode extends BaseNode {
  type: "EdgeExpr";
  left: IdentifierNode;
  relation: StringLiteralNode;
  right: IdentifierNode;
}
