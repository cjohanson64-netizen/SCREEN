import type { DirectiveParseShape } from "../../grammar/types.js";

export const BindDirectiveShape: DirectiveParseShape = {
  name: "@bind",
  family: "bind",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
