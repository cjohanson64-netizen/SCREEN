import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { BooleanLiteralNode } from "../literals/BooleanLiteralNode.js";
import type { PropertyAccessNode } from "./PropertyAccessNode.js";
import type { ObjectLiteralNode } from "./ObjectLiteralNode.js";
import type { ArrayLiteralNode } from "./ArrayLiteralNode.js";
import type { DirectiveCallExprNode } from "./DirectiveCallExprNode.js";
import type { NodeCaptureNode } from "../query/NodeCaptureNode.js";
import type { WhereExprNode } from "../query/WhereExprNode.js";
import type { ChooseExprNode } from "../action/ChooseExprNode.js";
import type { ComputeExprNode } from "../compute/ComputeExprNode.js";
import type { DeriveExprNode } from "../derive/DeriveExprNode.js";
import type { RuntimeGenerateNodeIdExprNode } from "../runtime/RuntimeGenerateNodeIdExprNode.js";
import type { RuntimeGenerateValueIdExprNode } from "../runtime/RuntimeGenerateValueIdExprNode.js";
import type { RuntimeNextOrderExprNode } from "../runtime/RuntimeNextOrderExprNode.js";

export type ValueExprNode =
  | IdentifierNode
  | PropertyAccessNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | RuntimeGenerateNodeIdExprNode
  | RuntimeGenerateValueIdExprNode
  | RuntimeNextOrderExprNode
  | NodeCaptureNode
  | WhereExprNode
  | ObjectLiteralNode
  | ArrayLiteralNode
  | ChooseExprNode
  | DirectiveCallExprNode
  | DeriveExprNode
  | ComputeExprNode;
