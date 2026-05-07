import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ComputeSourceNode } from "./ComputeSourceNode.js";

export interface ComputeAvgExprNode extends BaseNode {
  type: "ComputeAvgExpr";
  name: "@compute.avg";
  from: ComputeSourceNode | null;
  field: StringLiteralNode | null;
}
