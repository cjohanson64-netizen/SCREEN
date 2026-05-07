import type { BaseNode } from "../core/BaseNode.js";

export interface PreviousValueNode extends BaseNode {
  type: "PreviousValue";
  name: "previous";
}
