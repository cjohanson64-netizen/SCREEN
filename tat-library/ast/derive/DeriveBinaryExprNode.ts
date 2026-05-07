import type { BaseNode } from "../core/BaseNode.js";
import type { DeriveExprNode } from "./DeriveExprNode.js";

export interface DeriveBinaryExprNode extends BaseNode {
  type: "DeriveBinaryExpr";
  operator: "+" | "-" | "*" | "/" | "%";
  left: DeriveExprNode;
  right: DeriveExprNode;
}
