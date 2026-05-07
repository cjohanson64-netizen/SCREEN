import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ObjectPropertyNode } from "../expressions/ObjectLiteralNode.js";

export interface ValueDefNode extends BaseNode {
  type: "ValueDef";
  name: "@value.define";
  scopeName: IdentifierNode;
  entries: ObjectPropertyNode[];
}
