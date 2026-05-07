import type { ActionExprNode } from "../action/ActionExprNode.js";
import type { CtxExprNode } from "../ctx/CtxExprNode.js";
import type { ProjectExprNode } from "../projection/ProjectExprNode.js";

export type OperatorExprNode =
  | ActionExprNode
  | CtxExprNode
  | ProjectExprNode;
