import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ArgumentNode } from "../expressions/ArgumentNode.js";

export interface ProjectExprNode extends BaseNode {
  type: "ProjectExpr";
  name: "@project.apply";
  projectionName: IdentifierNode | null;
  args: ArgumentNode[];
}
