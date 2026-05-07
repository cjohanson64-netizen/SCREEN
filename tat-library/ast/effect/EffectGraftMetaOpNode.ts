import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface EffectGraftMetaOpNode extends BaseNode {
  type: "EffectGraftMetaOp";
  name: "@graft.meta";
  node: IdentifierNode;
  key: StringLiteralNode;
  value: ValueExprNode;
}
