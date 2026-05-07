import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export type EffectTargetNode = RootTargetNode | IdentifierNode;

export interface RootTargetNode extends BaseNode {
  type: "RootTarget";
  name: "root";
}
