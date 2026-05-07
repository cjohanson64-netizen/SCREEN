import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { ArrayLiteralNode } from "../expressions/ArrayLiteralNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";

export interface DerivePathExprNode extends BaseNode {
  type: "DerivePathExpr";
  name: "@derive.path";
  node: IdentifierNode | null;
  relation: StringLiteralNode | ArrayLiteralNode | null;
  direction: StringLiteralNode | null;
  depth: NumberLiteralNode | null;
  where: BooleanExprNode | null;
}
