import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorArrowSymbol: ParserSymbolSpec = {
  id: "arrow",
  tokenType: "ARROW",
  lexeme: "->",
  role: "operator",
  description: "Chains graph/action pipeline steps.",
};
