import type { BaseNode } from "../core/BaseNode.js";

export interface RegexLiteralNode extends BaseNode {
  type: "RegexLiteral";
  pattern: string;
  flags: string;
  raw: string;
}
