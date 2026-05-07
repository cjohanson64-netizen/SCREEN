import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { DeriveCollectExprNode } from "../derive/DeriveCollectExprNode.js";
import type { ComputeSourceNode } from "./ComputeSourceNode.js";

export interface ComputeSumExprNode extends BaseNode {
  type: "ComputeSumExpr";
  name: "@compute.sum";
  collect: DeriveCollectExprNode | null;
  from: ComputeSourceNode | null;
  field: StringLiteralNode | null;
}
