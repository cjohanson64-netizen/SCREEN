import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ComputeSourceNode } from "./ComputeSourceNode.js";

export interface ComputeMinExprNode extends BaseNode {
  type: "ComputeMinExpr";
  name: "@compute.min";
  from: ComputeSourceNode | null;
  field: StringLiteralNode | null;
}
