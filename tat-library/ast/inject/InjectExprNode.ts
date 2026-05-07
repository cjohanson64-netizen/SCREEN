import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface InjectExprNode extends BaseNode {
  type: "InjectExpr";
  name: "@inject";
  hookRef: IdentifierNode;
  fileExtension: StringLiteralNode;
  alias?: IdentifierNode | null;
}
