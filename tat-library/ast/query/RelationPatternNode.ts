import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { NumberLiteralNode } from "../literals/NumberLiteralNode.js";
import type { BooleanLiteralNode } from "../literals/BooleanLiteralNode.js";
import type { RegexLiteralNode } from "../literals/RegexLiteralNode.js";
import type { WildcardNode } from "../literals/WildcardNode.js";
import type { NodeCaptureNode } from "./NodeCaptureNode.js";

export interface RelationPatternNode extends BaseNode {
  type: "RelationPattern";
  left: PatternAtomNode;
  relation: PatternAtomNode;
  right: PatternAtomNode;
}

export type PatternAtomNode =
  | IdentifierNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | RegexLiteralNode
  | WildcardNode
  | NodeCaptureNode;
