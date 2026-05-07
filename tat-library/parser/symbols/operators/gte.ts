import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorGteSymbol: ParserSymbolSpec = {
  id: "gte",
  tokenType: "GTE",
  lexeme: ">=",
  role: "operator",
  description: "Greater-than-or-equal comparison.",
};
