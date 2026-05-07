import type { BaseNode } from "../core/BaseNode.js";
import type { QueryExprNode } from "../query/QueryExprNode.js";

export interface QueryStatementNode extends BaseNode {
  type: "QueryStatement";
  expr: QueryExprNode;
}
