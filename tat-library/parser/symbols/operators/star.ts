import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorStarSymbol: ParserSymbolSpec = {
  id: "star",
  tokenType: "STAR",
  lexeme: "*",
  role: "operator",
  description: "Derive arithmetic multiplication.",
};
