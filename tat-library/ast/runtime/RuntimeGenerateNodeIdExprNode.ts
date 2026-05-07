import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface RuntimeGenerateNodeIdExprNode extends BaseNode {
  type: "RuntimeGenerateNodeIdExpr";
  name: "@runtime.generateNodeId";
  prefix: StringLiteralNode | null;
}
