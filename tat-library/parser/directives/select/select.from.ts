import type { DirectiveParseShape } from "../../grammar/types.js";

export const SelectFromDirectiveShape: DirectiveParseShape = {
  name: "@select.from",
  family: "select",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RBRACE",
  notes: ["Selects the first candidate matching a structured where block."],
};
