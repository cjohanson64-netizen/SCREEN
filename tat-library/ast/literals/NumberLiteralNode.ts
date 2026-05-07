import type { BaseNode } from "../core/BaseNode.js";

export interface NumberLiteralNode extends BaseNode {
  type: "NumberLiteral";
  value: number;
  raw: string;
}
