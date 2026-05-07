import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorDotSymbol: ParserSymbolSpec = {
  id: "dot",
  tokenType: "DOT",
  lexeme: ".",
  role: "operator",
  description: "Accesses properties or directive namespaces.",
};
