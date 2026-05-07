import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export interface SeedNodeRefNode extends BaseNode {
  type: "SeedNodeRef";
  ref: IdentifierNode;
}
