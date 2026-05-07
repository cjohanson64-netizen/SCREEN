import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export interface GraphRefNode extends BaseNode {
  type: "GraphRef";
  name: "@graph";
  graphId: IdentifierNode;
}
