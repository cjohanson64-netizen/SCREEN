import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { TerminalGraphExprNode } from "../projection/TerminalGraphExprNode.js";

// Projects an already-built graph binding into a named view.
// Syntax: battleGraph = battle <> (graph, root)
export interface GraphProjectionNode extends BaseNode {
  type: "GraphProjection";
  name: IdentifierNode;
  source: IdentifierNode;
  projection: TerminalGraphExprNode;
}
