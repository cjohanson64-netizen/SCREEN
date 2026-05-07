import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { DeriveStateExprNode } from "../derive/DeriveStateExprNode.js";
import type { DeriveMetaExprNode } from "../derive/DeriveMetaExprNode.js";
import type { ComputeCountExprNode } from "../compute/ComputeCountExprNode.js";
import type { ComputeEdgeCountExprNode } from "../compute/ComputeEdgeCountExprNode.js";
import type { ComputeSumExprNode } from "../compute/ComputeSumExprNode.js";
import type { ComputeMinExprNode } from "../compute/ComputeMinExprNode.js";
import type { ComputeMaxExprNode } from "../compute/ComputeMaxExprNode.js";
import type { ComputeAvgExprNode } from "../compute/ComputeAvgExprNode.js";
import type { ComputeAbsExprNode } from "../compute/ComputeAbsExprNode.js";

export type RepeatCountExprNode =
  | NumberLiteralNode
  | DeriveStateExprNode
  | DeriveMetaExprNode
  | ComputeCountExprNode
  | ComputeEdgeCountExprNode
  | ComputeSumExprNode
  | ComputeMinExprNode
  | ComputeMaxExprNode
  | ComputeAvgExprNode
  | ComputeAbsExprNode;
