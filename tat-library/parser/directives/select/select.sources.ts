import type { DirectiveParseShape } from "../../grammar/types.js";

export const SelectSourcesDirectiveShape: DirectiveParseShape = {
  name: "@select.sources",
  family: "select",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
