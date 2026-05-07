import type { BaseNode } from "../core/BaseNode.js";
import type { WherePredicateNode } from "../query/WherePredicateNode.js";

export interface PruneNodesExprNode extends BaseNode {
  type: "PruneNodesExpr";
  name: "@prune.nodes";
  where: WherePredicateNode;
}
