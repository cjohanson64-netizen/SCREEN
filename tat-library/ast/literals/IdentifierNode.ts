import type { BaseNode } from "../core/BaseNode.js";

export interface IdentifierNode extends BaseNode {
  type: "Identifier";
  name: string;
}
