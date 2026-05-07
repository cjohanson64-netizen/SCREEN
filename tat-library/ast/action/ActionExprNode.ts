import type { BaseNode } from "../core/BaseNode.js";
import type { ActionGuardExprNode } from "./ActionGuardExprNode.js";
import type { ActionPipelineStepNode } from "./ActionPipelineStepNode.js";
import type { ActionProjectExprNode } from "../expressions/ActionProjectExprNode.js";

export interface ActionExprNode extends BaseNode {
  type: "ActionExpr";
  name: "@action.define";
  actionName: import("../literals/IdentifierNode.js").IdentifierNode;
  guard: ActionGuardExprNode | null;
  pipeline: ActionPipelineStepNode[];
  project: ActionProjectExprNode | null;
}
