import type { BaseNode } from "../core/BaseNode.js";

export interface WildcardNode extends BaseNode {
  type: "Wildcard";
  raw: "_";
}
