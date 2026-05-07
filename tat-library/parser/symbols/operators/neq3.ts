import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorNeq3Symbol: ParserSymbolSpec = {
  id: "neq3",
  tokenType: "NEQ3",
  lexeme: "!==",
  role: "operator",
  description: "Strict boolean inequality comparison.",
};
