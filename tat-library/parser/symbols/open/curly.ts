import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OpenCurlySymbol: ParserSymbolSpec = {
  id: "curly",
  tokenType: "LBRACE",
  lexeme: "{",
  role: "open",
  closes: "RBRACE",
  description: "Starts object/directive body.",
};
