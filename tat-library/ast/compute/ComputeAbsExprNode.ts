import type { BaseNode } from "../core/BaseNode.js";
import type { DeriveExprNode } from "../derive/DeriveExprNode.js";

export interface ComputeAbsExprNode extends BaseNode {
  type: "ComputeAbsExpr";
  name: "@compute.abs";
  value: DeriveExprNode | null;
}
