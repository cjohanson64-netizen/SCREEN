import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../literals/StringLiteralNode.js";

export interface ImportDeclarationNode extends BaseNode {
  type: "ImportDeclaration";
  specifiers: ImportSpecifierNode[];
  source: StringLiteralNode;
}

export interface ImportSpecifierNode extends BaseNode {
  type: "ImportSpecifier";
  imported: IdentifierNode;
  local: IdentifierNode;
}
