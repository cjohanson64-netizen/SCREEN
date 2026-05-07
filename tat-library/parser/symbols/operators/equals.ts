import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorEqualsSymbol: ParserSymbolSpec = {
  id: "equals",
  tokenType: "EQUALS",
  lexeme: "=",
  role: "operator",
  description: "Assigns node declarations.",
};
