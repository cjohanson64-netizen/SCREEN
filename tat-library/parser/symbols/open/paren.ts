import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OpenParenSymbol: ParserSymbolSpec = {
  id: "paren",
  tokenType: "LPAREN",
  lexeme: "(",
  role: "open",
  closes: "RPAREN",
  description: "Starts call arguments.",
};
