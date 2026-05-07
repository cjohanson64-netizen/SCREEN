import type { Token } from "../../../lexer/tokenize.js";

export function unexpectedTokenMessage(token: Token, expected: string): string {
  return `Expected ${expected}, got ${token.type}${token.value ? ` (${token.value})` : ""}`;
}
