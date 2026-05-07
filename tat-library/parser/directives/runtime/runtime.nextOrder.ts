import type { DirectiveParseShape } from "../../grammar/types.js";

export const RuntimeNextorderDirectiveShape: DirectiveParseShape = {
  name: "@runtime.nextOrder",
  family: "runtime",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
