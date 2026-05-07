import type { ParserSymbolSpec } from "../../grammar/types.js";

export const SeparatorDoubleColonSymbol: ParserSymbolSpec = {
  id: "doubleColon",
  tokenType: "DCOLON",
  lexeme: "::",
  role: "separator",
  description: "Separates graph interaction source/context/target forms.",
};
