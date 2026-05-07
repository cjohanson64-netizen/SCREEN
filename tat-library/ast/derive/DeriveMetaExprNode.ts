import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface DeriveMetaExprNode extends BaseNode {
  type: "DeriveMetaExpr";
  name: "@derive.meta";
  node: IdentifierNode | null;
  key: StringLiteralNode | null;
}
