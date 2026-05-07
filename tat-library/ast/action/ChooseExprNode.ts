import type { BaseNode } from "../core/BaseNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";
import type { GraphControlExprNode } from "./GraphControlExprNode.js";

export interface ChooseExprNode extends BaseNode {
  type: "ChooseExpr";
  name: "@choose";
  when: GraphControlExprNode | null;
  then: ValueExprNode | null;
  else: ValueExprNode | null;
}
