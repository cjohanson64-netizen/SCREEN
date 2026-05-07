import type { ParserSymbolSpec } from "../../grammar/types.js";

export const SeparatorCommaSymbol: ParserSymbolSpec = {
  id: "comma",
  tokenType: "COMMA",
  lexeme: ",",
  role: "separator",
  description: "Separates arguments, array items, and object properties.",
};
