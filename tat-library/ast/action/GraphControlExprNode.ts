import type { BooleanExprNode } from "../expressions/boolean/BooleanExprNode.js";
import type { GraphQueryExprNode } from "../query/GraphQueryExprNode.js";

export type GraphControlExprNode = GraphQueryExprNode | BooleanExprNode;
