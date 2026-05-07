import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OperatorSlashSymbol: ParserSymbolSpec = {
  id: "slash",
  tokenType: "SLASH",
  lexeme: "/",
  role: "operator",
  description: "Derive arithmetic division.",
};
