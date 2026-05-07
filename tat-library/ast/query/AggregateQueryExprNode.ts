import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface AggregateQueryExprNode extends BaseNode {
  type: "AggregateQueryExpr";
  name: "@query";
  typeName: StringLiteralNode | null;
}
