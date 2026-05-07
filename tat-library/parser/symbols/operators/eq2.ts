import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorEq2Symbol: ParserSymbolSpec = {
  id: "eq2",
  tokenType: "EQ2",
  lexeme: "==",
  role: "operator",
  description: "Boolean equality comparison.",
};
