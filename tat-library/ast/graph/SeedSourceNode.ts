import type { BaseNode } from "../core/BaseNode.js";
import type { SeedBlockNode } from "../statements/SeedBlockNode.js";

export interface SeedSourceNode extends BaseNode {
  type: "SeedSource";
  name: "@seed";
  seed?: SeedBlockNode;
}
