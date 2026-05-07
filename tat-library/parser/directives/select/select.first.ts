import type { DirectiveParseShape } from "../../grammar/types.js";

export const SelectFirstDirectiveShape: DirectiveParseShape = {
  name: "@select.first",
  family: "select",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
