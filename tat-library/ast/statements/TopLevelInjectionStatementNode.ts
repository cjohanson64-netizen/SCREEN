import type { BaseNode } from "../core/BaseNode.js";
import type { InjectExprNode } from "../inject/InjectExprNode.js";

export interface TopLevelInjectionStatementNode extends BaseNode {
  type: "TopLevelInjectionStatement";
  inject: InjectExprNode;
}
