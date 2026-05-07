import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export interface PropertyAccessNode extends BaseNode {
  type: "PropertyAccess";
  object: IdentifierNode;
  property: IdentifierNode;
  chain: IdentifierNode[];
}
