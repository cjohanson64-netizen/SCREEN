import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { BooleanLiteralNode } from "../literals/BooleanLiteralNode.js";
import type { ObjectLiteralNode } from "../expressions/ObjectLiteralNode.js";
import type { TraversalExprNode } from "../graph/TraversalExprNode.js";

export interface NodeCaptureNode extends BaseNode {
  type: "NodeCapture";
  shape: NodeShapeNode;
}

export type NodeShapeNode =
  | IdentifierNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | ObjectLiteralNode
  | TraversalExprNode;
