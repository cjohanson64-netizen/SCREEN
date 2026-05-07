import type { ParserSymbolSpec } from "../../grammar/types.js";

export const CloseParenSymbol: ParserSymbolSpec = {
  id: "paren",
  tokenType: "RPAREN",
  lexeme: ")",
  role: "close",
  opens: "LPAREN",
  description: "Ends call arguments.",
};
