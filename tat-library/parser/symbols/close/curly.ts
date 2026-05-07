import type { ParserSymbolSpec } from "../../grammar/types.js";

export const CloseCurlySymbol: ParserSymbolSpec = {
  id: "curly",
  tokenType: "RBRACE",
  lexeme: "}",
  role: "close",
  opens: "LBRACE",
  description: "Ends object/directive body.",
};
