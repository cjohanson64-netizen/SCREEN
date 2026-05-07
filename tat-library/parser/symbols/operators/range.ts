import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorRangeSymbol: ParserSymbolSpec = {
  id: "range",
  tokenType: "DDOT",
  lexeme: "..",
  role: "operator",
  description: "Represents traversal/range-style syntax.",
};
