import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { BooleanLiteralNode } from "../literals/BooleanLiteralNode.js";
import type { PropertyAccessNode } from "./PropertyAccessNode.js";
import type { ObjectLiteralNode } from "./ObjectLiteralNode.js";
import type { ArrayLiteralNode } from "./ArrayLiteralNode.js";
import type { NodeCaptureNode } from "../query/NodeCaptureNode.js";
import type { RuntimeGenerateNodeIdExprNode } from "../runtime/RuntimeGenerateNodeIdExprNode.js";
import type { RuntimeGenerateValueIdExprNode } from "../runtime/RuntimeGenerateValueIdExprNode.js";
import type { RuntimeNextOrderExprNode } from "../runtime/RuntimeNextOrderExprNode.js";

export type ActionProjectExprNode =
  | IdentifierNode
  | PropertyAccessNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | RuntimeGenerateNodeIdExprNode
  | RuntimeGenerateValueIdExprNode
  | RuntimeNextOrderExprNode
  | NodeCaptureNode
  | ObjectLiteralNode
  | ArrayLiteralNode;
