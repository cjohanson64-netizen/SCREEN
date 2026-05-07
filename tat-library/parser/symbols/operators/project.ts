import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorProjectSymbol: ParserSymbolSpec = {
  id: "project",
  tokenType: "PROJECT",
  lexeme: "=>",
  role: "operator",
  description: "Projects a graph/control expression into another form.",
};
