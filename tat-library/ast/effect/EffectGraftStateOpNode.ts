import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface EffectGraftStateOpNode extends BaseNode {
  type: "EffectGraftStateOp";
  name: "@graft.state";
  node: IdentifierNode;
  key: StringLiteralNode;
  value: ValueExprNode;
}
