import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { ValueExprNode } from "../expressions/ValueExprNode.js";

export interface TraversalExprNode extends BaseNode {
  type: "TraversalExpr";
  segments: TraversalSegmentNode[];
}

export type TraversalSegmentNode = ActionSegmentNode | ContextLiftNode;

export interface ActionSegmentNode extends BaseNode {
  type: "ActionSegment";
  from: ValueExprNode;
  operator: IdentifierNode;
  to: ValueExprNode;
}

export interface ContextLiftNode extends BaseNode {
  type: "ContextLift";
  context: IdentifierNode;
  segment: ActionSegmentNode;
}
