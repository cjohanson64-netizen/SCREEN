import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface PruneMetaExprNode extends BaseNode {
  type: "PruneMetaExpr";
  name: "@prune.meta";
  node: IdentifierNode;
  key: StringLiteralNode;
}
