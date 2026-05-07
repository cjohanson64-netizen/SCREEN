import type { ParserSymbolSpec } from "../../grammar/types.js";

export const SeparatorTripleColonSymbol: ParserSymbolSpec = {
  id: "tripleColon",
  tokenType: "TCOLON",
  lexeme: ":::",
  role: "separator",
  description: "Reserved high-specificity structural separator.",
};
