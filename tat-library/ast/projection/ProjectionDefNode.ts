import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";
import type { ObjectLiteralNode } from "../expressions/ObjectLiteralNode.js";
import type { ProjectionContractNode } from "./ProjectionContractNode.js";

export interface ProjectionDefNode extends BaseNode {
  type: "ProjectionDef";
  name: IdentifierNode;
  focus: ValueExprNode | null;
  contract: ProjectionContractNode | null;
  fields: ObjectLiteralNode;
}
