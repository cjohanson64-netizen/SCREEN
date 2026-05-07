import type { BaseNode } from "../core/BaseNode.js";

export interface BooleanLiteralNode extends BaseNode {
  type: "BooleanLiteral";
  value: boolean;
  raw: string;
}
