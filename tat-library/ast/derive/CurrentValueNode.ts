import type { BaseNode } from "../core/BaseNode.js";

export interface CurrentValueNode extends BaseNode {
  type: "CurrentValue";
  name: "current";
}
