import type { MatchExprNode } from "./MatchExprNode.js";
import type { PathExprNode } from "./PathExprNode.js";
import type { WhyExprNode } from "./WhyExprNode.js";
import type { HowExprNode } from "./HowExprNode.js";
import type { WhereExprNode } from "./WhereExprNode.js";
import type { GraphQueryExprNode } from "./GraphQueryExprNode.js";

export type QueryExprNode =
  | MatchExprNode
  | PathExprNode
  | WhyExprNode
  | HowExprNode
  | WhereExprNode
  | GraphQueryExprNode;
