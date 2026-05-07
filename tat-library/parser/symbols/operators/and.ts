import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorAndSymbol: ParserSymbolSpec = {
  id: "and",
  tokenType: "AND",
  lexeme: "&&",
  role: "operator",
  description: "Boolean AND.",
};
