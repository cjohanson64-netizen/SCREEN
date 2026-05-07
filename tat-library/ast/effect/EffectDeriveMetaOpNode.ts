import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { DeriveExprNode } from "../derive/DeriveExprNode.js";

export interface EffectDeriveMetaOpNode extends BaseNode {
  type: "EffectDeriveMetaOp";
  name: "@derive.meta";
  key: StringLiteralNode;
  expression: DeriveExprNode;
}
