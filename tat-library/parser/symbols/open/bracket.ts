import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OpenBracketSymbol: ParserSymbolSpec = {
  id: "bracket",
  tokenType: "LBRACKET",
  lexeme: "[",
  role: "open",
  closes: "RBRACKET",
  description: "Starts array or edge-entry structure.",
};
