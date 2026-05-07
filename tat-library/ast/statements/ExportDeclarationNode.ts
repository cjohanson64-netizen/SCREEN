import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";

export interface ExportDeclarationNode extends BaseNode {
  type: "ExportDeclaration";
  specifiers: ExportSpecifierNode[];
}

export interface ExportSpecifierNode extends BaseNode {
  type: "ExportSpecifier";
  local: IdentifierNode;
}
