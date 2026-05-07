import type { BaseNode } from "../core/BaseNode.js";

export interface RuntimeNextOrderExprNode extends BaseNode {
  type: "RuntimeNextOrderExpr";
  name: "@runtime.nextOrder";
}
