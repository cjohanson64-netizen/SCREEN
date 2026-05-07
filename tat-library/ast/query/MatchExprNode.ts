import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";
import type { RelationPatternNode } from "./RelationPatternNode.js";

export interface MatchExprNode extends BaseNode {
  type: "MatchExpr";
  edge: IdentifierNode | null;
  pattern: RelationPatternNode | null;
  patterns: RelationPatternNode[];
  where: BooleanExprNode | null;
}
