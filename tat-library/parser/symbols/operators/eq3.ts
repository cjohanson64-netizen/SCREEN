import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorEq3Symbol: ParserSymbolSpec = {
  id: "eq3",
  tokenType: "EQ3",
  lexeme: "===",
  role: "operator",
  description: "Strict boolean equality comparison.",
};
