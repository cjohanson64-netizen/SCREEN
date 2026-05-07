import type { BaseNode } from "../core/BaseNode.js";
import type { WherePredicateNode } from "../query/WherePredicateNode.js";

export interface PruneEdgesExprNode extends BaseNode {
  type: "PruneEdgesExpr";
  name: "@prune.edges";
  where: WherePredicateNode;
}
