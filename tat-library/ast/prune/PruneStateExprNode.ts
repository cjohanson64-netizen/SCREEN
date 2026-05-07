import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface PruneStateExprNode extends BaseNode {
  type: "PruneStateExpr";
  name: "@prune.state";
  node: IdentifierNode;
  key: StringLiteralNode;
}
