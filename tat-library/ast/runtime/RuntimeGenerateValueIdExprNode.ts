import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface RuntimeGenerateValueIdExprNode extends BaseNode {
  type: "RuntimeGenerateValueIdExpr";
  name: "@runtime.generateValueId";
  prefix: StringLiteralNode | null;
}
