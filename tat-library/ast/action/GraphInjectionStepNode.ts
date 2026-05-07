import type { BaseNode } from "../core/BaseNode.js";
import type { InjectExprNode } from "../inject/InjectExprNode.js";

export interface GraphInjectionStepNode extends BaseNode {
  type: "GraphInjectionStep";
  inject: InjectExprNode;
}
