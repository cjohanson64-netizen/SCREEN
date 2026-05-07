import type { ComputeCountExprNode } from "./ComputeCountExprNode.js";
import type { ComputeEdgeCountExprNode } from "./ComputeEdgeCountExprNode.js";
import type { ComputeExistsExprNode } from "./ComputeExistsExprNode.js";
import type { ComputeSumExprNode } from "./ComputeSumExprNode.js";
import type { ComputeMinExprNode } from "./ComputeMinExprNode.js";
import type { ComputeMaxExprNode } from "./ComputeMaxExprNode.js";
import type { ComputeAvgExprNode } from "./ComputeAvgExprNode.js";
import type { ComputeAbsExprNode } from "./ComputeAbsExprNode.js";

export type ComputeExprNode =
  | ComputeCountExprNode
  | ComputeEdgeCountExprNode
  | ComputeExistsExprNode
  | ComputeSumExprNode
  | ComputeMinExprNode
  | ComputeMaxExprNode
  | ComputeAvgExprNode
  | ComputeAbsExprNode;
