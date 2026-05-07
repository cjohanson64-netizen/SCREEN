import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { NodeCaptureNode } from "../query/NodeCaptureNode.js";

export interface ApplyExprNode extends BaseNode {
  type: "ApplyExpr";
  name: "@action.apply";
  target: IdentifierNode | NodeCaptureNode;
}
