import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ObjectLiteralNode } from "../expressions/ObjectLiteralNode.js";
import type { SeedNodeRefNode } from "../graph/SeedNodeRefNode.js";
import type { SeedEdgeEntryNode } from "../graph/SeedEdgeEntryNode.js";

export interface SeedBlockNode extends BaseNode {
  type: "SeedBlock";
  nodes: SeedNodeRefNode[];
  edges: SeedEdgeEntryNode[];
  state: ObjectLiteralNode;
  meta: ObjectLiteralNode;
  root: IdentifierNode;
}
