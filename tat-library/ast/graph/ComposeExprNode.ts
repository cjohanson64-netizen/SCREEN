import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ObjectLiteralNode } from "../expressions/ObjectLiteralNode.js";

export interface ComposeExprNode extends BaseNode {
  type: "ComposeExpr";
  name: "@compose";
  from: IdentifierNode[];
  keep: ObjectLiteralNode | null;
  prune: ObjectLiteralNode | null;
  mergePolicy: ObjectLiteralNode;

  /** Legacy normalized aliases retained until Phase 6 orphan cleanup. */
  assets: IdentifierNode[];
  merge: IdentifierNode;
}
