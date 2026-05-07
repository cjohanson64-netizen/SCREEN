import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface DeriveStateExprNode extends BaseNode {
  type: "DeriveStateExpr";
  name: "@derive.state";
  node: IdentifierNode | null;
  key: StringLiteralNode | null;
}
