import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { DeriveExprNode } from "../derive/DeriveExprNode.js";

export interface EffectDeriveStateOpNode extends BaseNode {
  type: "EffectDeriveStateOp";
  name: "@derive.state";
  key: StringLiteralNode;
  expression: DeriveExprNode;
}
