import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { DerivePathExprNode } from "../derive/DerivePathExprNode.js";

export interface ComputeExistsExprNode extends BaseNode {
  type: "ComputeExistsExpr";
  name: "@compute.exists";
  path: DerivePathExprNode | IdentifierNode | null;
}
