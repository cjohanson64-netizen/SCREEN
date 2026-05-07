import type { TokenType } from "../../../lexer/tokenize.js";

export function missingCloseMessage(expected: TokenType, context: string): string {
  return `Expected closing ${expected} for ${context}`;
}
