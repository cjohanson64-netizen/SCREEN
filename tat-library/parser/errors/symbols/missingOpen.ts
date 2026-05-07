import type { TokenType } from "../../../lexer/tokenize.js";

export function missingOpenMessage(expected: TokenType, context: string): string {
  return `Expected opening ${expected} for ${context}`;
}
