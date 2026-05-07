import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { RuntimeGenerateNodeIdExprNode } from "./RuntimeGenerateNodeIdExprNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface RuntimeAddNodeExprNode extends BaseNode {
  type: "RuntimeAddNodeExpr";
  name: "@runtime.addNode";
  node: IdentifierNode | RuntimeGenerateNodeIdExprNode;
  value: ValueExprNode;
  state: ValueExprNode;
  meta: ValueExprNode;
}
