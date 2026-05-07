import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorOrSymbol: ParserSymbolSpec = {
  id: "or",
  tokenType: "OR",
  lexeme: "||",
  role: "operator",
  description: "Boolean OR.",
};
