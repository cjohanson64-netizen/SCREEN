import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { AggregateQueryExprNode } from "../query/AggregateQueryExprNode.js";
import type { DerivePathExprNode } from "../derive/DerivePathExprNode.js";

export type ComputeSourceNode =
  | DerivePathExprNode
  | AggregateQueryExprNode
  | IdentifierNode;
