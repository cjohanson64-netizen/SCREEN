import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ComputeSourceNode } from "./ComputeSourceNode.js";

export interface ComputeMaxExprNode extends BaseNode {
  type: "ComputeMaxExpr";
  name: "@compute.max";
  from: ComputeSourceNode | null;
  field: StringLiteralNode | null;
}
