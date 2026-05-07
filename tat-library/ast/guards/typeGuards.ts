import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { NodeCaptureNode } from "../query/NodeCaptureNode.js";
import type { TraversalExprNode } from "../graph/TraversalExprNode.js";
import type { MatchExprNode } from "../query/MatchExprNode.js";
import type { PathExprNode } from "../query/PathExprNode.js";
import type { WhyExprNode } from "../query/WhyExprNode.js";
import type { HowExprNode } from "../query/HowExprNode.js";
import type { SeedEdgeBindingNode } from "../graph/SeedEdgeEntryNode.js";

export function isIdentifierNode(node: unknown): node is IdentifierNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "Identifier";
}

export function isNodeCaptureNode(node: unknown): node is NodeCaptureNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "NodeCapture";
}

export function isTraversalExprNode(node: unknown): node is TraversalExprNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "TraversalExpr";
}

export function isMatchExprNode(node: unknown): node is MatchExprNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "MatchExpr";
}

export function isPathExprNode(node: unknown): node is PathExprNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "PathExpr";
}

export function isWhyExprNode(node: unknown): node is WhyExprNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "WhyExpr";
}

export function isHowExprNode(node: unknown): node is HowExprNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "HowExpr";
}

export function isSeedEdgeBindingNode(node: unknown): node is SeedEdgeBindingNode {
  return !!node && typeof node === "object" && (node as BaseNode).type === "SeedEdgeBinding";
}
