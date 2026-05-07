import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface GraphQueryExprNode extends BaseNode {
  type: "GraphQueryExpr";
  name: "@query" | "@query.edge" | "@query.state" | "@query.meta";
  subject: IdentifierNode | null;
  relation: StringLiteralNode | null;
  object: IdentifierNode | null;
  node: IdentifierNode | null;
  state: StringLiteralNode | null;
  meta: StringLiteralNode | null;
  equals: ValueExprNode | null;
}
