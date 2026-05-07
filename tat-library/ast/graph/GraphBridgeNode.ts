import type { BaseNode } from "../core/BaseNode.js";
import type { CtxExprNode } from "../ctx/CtxExprNode.js";

export type GraphBridgeNode = ExplicitGraphBridgeNode | ImplicitGraphBridgeNode;

export interface ExplicitGraphBridgeNode extends BaseNode {
  type: "ExplicitGraphBridge";
  ctx: CtxExprNode;
}

export interface ImplicitGraphBridgeNode extends BaseNode {
  type: "ImplicitGraphBridge";
}