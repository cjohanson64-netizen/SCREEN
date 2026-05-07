import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export interface CtxClearExprNode extends BaseNode {
  type: "CtxClearExpr";
  name: "@ctx.clear";
  edge: IdentifierNode;
}
