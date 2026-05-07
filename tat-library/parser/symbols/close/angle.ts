import type { ParserSymbolSpec } from "../../grammar/types.js";

export const CloseAngleSymbol: ParserSymbolSpec = {
  id: "angle",
  tokenType: "RANGLE",
  lexeme: ">",
  role: "close",
  opens: "LANGLE",
  description: "Ends node capture or node-shape payload.",
};
