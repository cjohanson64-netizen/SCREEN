import type { BaseNode } from "../core/BaseNode.js";

export interface StringLiteralNode extends BaseNode {
  type: "StringLiteral";
  value: string;
  raw: string;
}
