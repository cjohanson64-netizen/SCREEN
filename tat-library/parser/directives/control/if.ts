import type { DirectiveParseShape } from "../../grammar/types.js";

export const IfDirectiveShape: DirectiveParseShape = {
  name: "@if",
  family: "action",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LBRACE",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  sections: ["when", "then", "else"],
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
