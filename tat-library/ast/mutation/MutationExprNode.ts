import type { RuntimeAddNodeExprNode } from "../runtime/RuntimeAddNodeExprNode.js";
import type { RuntimeUpdateNodeValueExprNode } from "../runtime/RuntimeUpdateNodeValueExprNode.js";
import type { RuntimeDeleteNodeExprNode } from "../runtime/RuntimeDeleteNodeExprNode.js";
import type { GraftBranchExprNode } from "../graft/GraftBranchExprNode.js";
import type { GraftStateExprNode } from "../graft/GraftStateExprNode.js";
import type { GraftMetaExprNode } from "../graft/GraftMetaExprNode.js";
import type { GraftProgressExprNode } from "../graft/GraftProgressExprNode.js";
import type { PruneBranchExprNode } from "../prune/PruneBranchExprNode.js";
import type { PruneStateExprNode } from "../prune/PruneStateExprNode.js";
import type { PruneMetaExprNode } from "../prune/PruneMetaExprNode.js";
import type { PruneNodesExprNode } from "../prune/PruneNodesExprNode.js";
import type { PruneEdgesExprNode } from "../prune/PruneEdgesExprNode.js";
import type { CtxSetExprNode } from "../ctx/CtxSetExprNode.js";
import type { CtxClearExprNode } from "../ctx/CtxClearExprNode.js";
import type { ApplyExprNode } from "../action/ApplyExprNode.js";

export type MutationExprNode =
  | RuntimeAddNodeExprNode
  | RuntimeUpdateNodeValueExprNode
  | RuntimeDeleteNodeExprNode
  | GraftBranchExprNode
  | GraftStateExprNode
  | GraftMetaExprNode
  | GraftProgressExprNode
  | PruneBranchExprNode
  | PruneStateExprNode
  | PruneMetaExprNode
  | PruneNodesExprNode
  | PruneEdgesExprNode
  | CtxSetExprNode
  | CtxClearExprNode
  | ApplyExprNode;
