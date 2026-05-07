import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";

export interface ComputeEdgeCountExprNode extends BaseNode {
  type: "ComputeEdgeCountExpr";
  name: "@compute.edgeCount";
  node: IdentifierNode | null;
  relation: StringLiteralNode | null;
  direction: StringLiteralNode | null;
  where: BooleanExprNode | null;
}
