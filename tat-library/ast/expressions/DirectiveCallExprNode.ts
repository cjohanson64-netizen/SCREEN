import type { BaseNode } from "../core/BaseNode.js";
import type { ArgumentNode } from "./ArgumentNode.js";
import type { WhereExprNode } from "../query/WhereExprNode.js";

export interface DirectiveCallExprNode extends BaseNode {
  type: "DirectiveCallExpr";
  name: string;
  args: ArgumentNode[];
  where: WhereExprNode | null;
}
