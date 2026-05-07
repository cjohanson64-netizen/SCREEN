import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface CtxSetExprNode extends BaseNode {
  type: "CtxSetExpr";
  name: "@ctx.set";
  edge: IdentifierNode;
  context: ValueExprNode;
}
