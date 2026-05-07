import type { DirectiveParseShape } from "../../grammar/types.js";

export const RepeatDirectiveShape: DirectiveParseShape = {
  name: "@repeat",
  family: "action",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LBRACE",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  sections: ["count", "forEach", "do"],
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
