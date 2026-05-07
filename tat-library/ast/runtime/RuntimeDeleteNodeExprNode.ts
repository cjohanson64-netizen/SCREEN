import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export interface RuntimeDeleteNodeExprNode extends BaseNode {
  type: "RuntimeDeleteNodeExpr";
  name: "@runtime.deleteNode";
  node: IdentifierNode;
}
