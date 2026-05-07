import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorBangSymbol: ParserSymbolSpec = {
  id: "bang",
  tokenType: "BANG",
  lexeme: "!",
  role: "operator",
  description: "Boolean NOT.",
};
