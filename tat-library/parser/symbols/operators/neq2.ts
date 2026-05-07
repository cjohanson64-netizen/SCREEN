import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorNeq2Symbol: ParserSymbolSpec = {
  id: "neq2",
  tokenType: "NEQ2",
  lexeme: "!=",
  role: "operator",
  description: "Boolean inequality comparison.",
};
