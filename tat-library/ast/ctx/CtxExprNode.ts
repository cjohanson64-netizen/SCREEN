import type { BaseNode } from "../core/BaseNode.js";
import type { ArgumentNode } from "../expressions/ArgumentNode.js";

export interface CtxExprNode extends BaseNode {
  type: "CtxExpr";
  name: "@ctx";
  args: ArgumentNode[];
}
