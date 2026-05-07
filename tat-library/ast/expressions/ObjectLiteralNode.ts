import type { BaseNode } from "../core/BaseNode.js";
import type { ValueExprNode } from "./ValueExprNode.js";

export interface ObjectLiteralNode extends BaseNode {
  type: "ObjectLiteral";
  properties: ObjectPropertyNode[];
}

export interface ObjectPropertyNode extends BaseNode {
  type: "ObjectProperty";
  key: string;
  value: ValueExprNode;
}
