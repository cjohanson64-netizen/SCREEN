import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { EdgeExprNode } from "./EdgeExprNode.js";

export type SeedEdgeEntryNode = EdgeExprNode | SeedEdgeBindingNode;

export interface SeedEdgeBindingNode extends BaseNode {
  type: "SeedEdgeBinding";
  name: IdentifierNode;
  edge: EdgeExprNode;
}
