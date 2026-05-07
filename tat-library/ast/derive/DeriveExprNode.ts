import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { CurrentValueNode } from "./CurrentValueNode.js";
import type { PreviousValueNode } from "./PreviousValueNode.js";
import type { DeriveBinaryExprNode } from "./DeriveBinaryExprNode.js";
import type { DeriveStateExprNode } from "./DeriveStateExprNode.js";
import type { DeriveMetaExprNode } from "./DeriveMetaExprNode.js";
import type { DerivePathExprNode } from "./DerivePathExprNode.js";
import type { DeriveCollectExprNode } from "./DeriveCollectExprNode.js";
import type { ComputeExprNode } from "../compute/ComputeExprNode.js";

export type DeriveExprNode =
  | CurrentValueNode
  | PreviousValueNode
  | NumberLiteralNode
  | StringLiteralNode
  | DeriveStateExprNode
  | DeriveMetaExprNode
  | DerivePathExprNode
  | DeriveCollectExprNode
  | DeriveBinaryExprNode
  | ComputeExprNode;
