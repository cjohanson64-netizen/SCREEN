import type { ParserSymbolSpec } from "../../grammar/types.js";

export const SeparatorColonSymbol: ParserSymbolSpec = {
  id: "colon",
  tokenType: "COLON",
  lexeme: ":",
  role: "separator",
  description: "Separates labels, relation entries, and directive block headers.",
};
