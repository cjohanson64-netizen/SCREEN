import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorPercentSymbol: ParserSymbolSpec = {
  id: "percent",
  tokenType: "PERCENT",
  lexeme: "%",
  role: "operator",
  description: "Remainder/modulo operator.",
};
