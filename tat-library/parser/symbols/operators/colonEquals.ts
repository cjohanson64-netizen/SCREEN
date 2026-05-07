import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorColonEqualsSymbol: ParserSymbolSpec = {
  id: "colonEquals",
  tokenType: "COLON_EQUALS",
  lexeme: ":=",
  role: "operator",
  description: "Defines graph pipelines.",
};
