import type { BaseNode } from "../core/BaseNode.js";
import type { MatchExprNode } from "./MatchExprNode.js";
import type { PathExprNode } from "./PathExprNode.js";
import type { GraphQueryExprNode } from "./GraphQueryExprNode.js";
import type { DirectiveCallExprNode } from "../expressions/DirectiveCallExprNode.js";
import type { DeriveStateExprNode } from "../derive/DeriveStateExprNode.js";
import type { DeriveMetaExprNode } from "../derive/DeriveMetaExprNode.js";
import type { DeriveCollectExprNode } from "../derive/DeriveCollectExprNode.js";
import type { ComputeCountExprNode } from "../compute/ComputeCountExprNode.js";
import type { ComputeEdgeCountExprNode } from "../compute/ComputeEdgeCountExprNode.js";
import type { ComputeExistsExprNode } from "../compute/ComputeExistsExprNode.js";
import type { ComputeSumExprNode } from "../compute/ComputeSumExprNode.js";
import type { ComputeMinExprNode } from "../compute/ComputeMinExprNode.js";
import type { ComputeMaxExprNode } from "../compute/ComputeMaxExprNode.js";
import type { ComputeAvgExprNode } from "../compute/ComputeAvgExprNode.js";
import type { ComputeAbsExprNode } from "../compute/ComputeAbsExprNode.js";
import type { ProjectExprNode } from "../projection/ProjectExprNode.js";

export interface WhyExprNode extends BaseNode {
  type: "WhyExpr";
  target: WhyTargetNode;
}

export type WhyTargetNode =
  | GraphQueryExprNode
  | MatchExprNode
  | PathExprNode
  | DirectiveCallExprNode
  | DeriveStateExprNode
  | DeriveMetaExprNode
  | DeriveCollectExprNode
  | ComputeCountExprNode
  | ComputeEdgeCountExprNode
  | ComputeExistsExprNode
  | ComputeSumExprNode
  | ComputeMinExprNode
  | ComputeMaxExprNode
  | ComputeAvgExprNode
  | ComputeAbsExprNode
  | ProjectExprNode;
