import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorMinusSymbol: ParserSymbolSpec = {
  id: "minus",
  tokenType: "MINUS",
  lexeme: "-",
  role: "operator",
  description: "Derive arithmetic subtraction.",
};
