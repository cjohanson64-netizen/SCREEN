import type { SeedSourceNode } from "./SeedSourceNode.js";
import type { ComposeExprNode } from "./ComposeExprNode.js";
import type { GraphRefNode } from "./GraphRefNode.js";

export type GraphSourceNode = SeedSourceNode | ComposeExprNode | GraphRefNode;
