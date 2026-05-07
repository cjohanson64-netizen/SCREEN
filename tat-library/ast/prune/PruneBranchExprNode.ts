import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface PruneBranchExprNode extends BaseNode {
  type: "PruneBranchExpr";
  name: "@prune.branch";
  subject: IdentifierNode;
  relation: StringLiteralNode;
  object: IdentifierNode;
  metadata: ValueExprNode | null;
}
