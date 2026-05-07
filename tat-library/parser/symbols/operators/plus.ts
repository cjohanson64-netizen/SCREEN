import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorPlusSymbol: ParserSymbolSpec = {
  id: "plus",
  tokenType: "PLUS",
  lexeme: "+",
  role: "operator",
  description: "Derive arithmetic addition.",
};
