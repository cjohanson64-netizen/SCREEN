import type { Token } from "../../lexer/tokenize.js";
import type { BaseNode, BooleanLiteralNode, IdentifierNode, NodeCaptureNode, NumberLiteralNode, RegexLiteralNode, StringLiteralNode, WildcardNode } from "../../ast/nodeTypes.js";

export function stripQuotes(raw: string): string {
  if (raw.length >= 2) return raw.slice(1, -1);
  return raw;
}
export function splitRegexLiteral(raw: string): { pattern: string; flags: string } {
  const lastSlash = raw.lastIndexOf("/");
  if (lastSlash <= 0) return { pattern: raw, flags: "" };
  return { pattern: raw.slice(1, lastSlash), flags: raw.slice(lastSlash + 1) };
}
export function identToToken(node: IdentifierNode): Token {
  return { type: "IDENT", value: node.name, line: node.span?.line ?? 0, column: node.span?.column ?? 0, index: node.span?.start ?? 0 };
}
export function atomToToken(node: IdentifierNode | StringLiteralNode | NumberLiteralNode | BooleanLiteralNode | RegexLiteralNode | WildcardNode | NodeCaptureNode): Token {
  return { type: "IDENT", value: node.type, line: node.span?.line ?? 0, column: node.span?.column ?? 0, index: node.span?.start ?? 0 };
}
export function nodeToToken(node: BaseNode): Token {
  return { type: "IDENT", value: node.type, line: node.span?.line ?? 0, column: node.span?.column ?? 0, index: node.span?.start ?? 0 };
}

export function makeNode<T extends BaseNode>(
  parser: any,
  type: T["type"],
  fields: Omit<T, "type" | "span">,
  start: Token,
): T {
  return parser.node(type, fields, start) as T;
}
