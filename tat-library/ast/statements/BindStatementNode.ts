import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { BindLayer } from "../bind/BindLayer.js";
import type { BindEntity } from "../bind/BindEntity.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface BindStatementNode extends BaseNode {
  type: "BindStatement";
  layer: BindLayer | null;
  entity: BindEntity | null;
  name: IdentifierNode;
  expression: ValueExprNode;
}
