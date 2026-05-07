import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorLteSymbol: ParserSymbolSpec = {
  id: "lte",
  tokenType: "LTE",
  lexeme: "<=",
  role: "operator",
  description: "Less-than-or-equal comparison.",
};
