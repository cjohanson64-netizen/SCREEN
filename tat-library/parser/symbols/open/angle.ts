import type { ParserSymbolSpec } from "../../grammar/types.js";

export const OpenAngleSymbol: ParserSymbolSpec = {
  id: "angle",
  tokenType: "LANGLE",
  lexeme: "<",
  role: "open",
  closes: "RANGLE",
  description: "Starts node capture or node-shape payload.",
};
