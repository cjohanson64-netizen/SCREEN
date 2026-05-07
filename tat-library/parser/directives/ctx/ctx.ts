import type { DirectiveParseShape } from "../../grammar/types.js";

export const CtxDirectiveShape: DirectiveParseShape = {
  name: "@ctx",
  family: "ctx",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
