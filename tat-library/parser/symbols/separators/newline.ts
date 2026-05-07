import type { ParserSymbolSpec } from "../../grammar/types.js";

export const SeparatorNewlineSymbol: ParserSymbolSpec = {
  id: "newline",
  tokenType: "NEWLINE",
  lexeme: "\n",
  role: "separator",
  description: "Separates statements and block lines.",
};
