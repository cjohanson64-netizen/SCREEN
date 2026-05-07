import type { ParserSymbolSpec } from "../../grammar/types.js";

export const CloseBracketSymbol: ParserSymbolSpec = {
  id: "bracket",
  tokenType: "RBRACKET",
  lexeme: "]",
  role: "close",
  opens: "LBRACKET",
  description: "Ends array or edge-entry structure.",
};
