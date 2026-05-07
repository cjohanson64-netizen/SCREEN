import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface SystemRelationNode extends BaseNode {
  type: "SystemRelation";
  left: IdentifierNode;
  relation: StringLiteralNode | null;
  right: IdentifierNode;
}
