import type { BaseNode } from "../core/BaseNode.js";
import type { DerivePathExprNode } from "../derive/DerivePathExprNode.js";
import type { ComputeSourceNode } from "./ComputeSourceNode.js";

export interface ComputeCountExprNode extends BaseNode {
  type: "ComputeCountExpr";
  name: "@compute.count";
  nodes: DerivePathExprNode | null;
  from: ComputeSourceNode | null;
}
