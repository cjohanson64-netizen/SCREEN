import type { BaseNode } from "../core/BaseNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";
import type { ObjectLiteralNode } from "../expressions/ObjectLiteralNode.js";
import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";

export type PathQuestionKind =
  | "@path.has"
  | "@path.first"
  | "@path.count"
  | "@path.through";

export interface PathExprNode extends BaseNode {
  type: "PathExpr";
  name: PathQuestionKind;
  from: ValueExprNode;
  to: ValueExprNode;
  options: ObjectLiteralNode | null;
  where: BooleanExprNode | null;
}
