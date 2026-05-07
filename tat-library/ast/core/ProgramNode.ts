import type { BaseNode } from "./BaseNode.js";
import type { StatementNode } from "../statements/StatementNode.js";

export interface ProgramNode extends BaseNode {
  type: "Program";
  body: StatementNode[];
}
