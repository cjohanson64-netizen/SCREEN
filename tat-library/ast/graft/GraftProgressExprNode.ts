import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface GraftProgressExprNode extends BaseNode {
  type: "GraftProgressExpr";
  name: "@graft.progress";
  from: IdentifierNode;
  relation: StringLiteralNode;
  to: IdentifierNode;
}
