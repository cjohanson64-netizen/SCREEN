import type { BaseNode } from "../core/BaseNode.js";
import type { ValueExprNode } from "./ValueExprNode.js";

export interface ArrayLiteralNode extends BaseNode {
  type: "ArrayLiteral";
  elements: ValueExprNode[];
}
