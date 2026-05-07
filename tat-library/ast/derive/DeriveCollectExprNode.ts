import type { BaseNode } from "../core/BaseNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";
import type { DerivePathExprNode } from "./DerivePathExprNode.js";

export interface DeriveCollectExprNode extends BaseNode {
  type: "DeriveCollectExpr";
  name: "@derive.collect";
  path: DerivePathExprNode | null;
  layer: StringLiteralNode | null;
  key: StringLiteralNode | null;
}
