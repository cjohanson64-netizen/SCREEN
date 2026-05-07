import type { DirectiveParseShape } from "../../grammar/types.js";

export const WhenDirectiveShape: DirectiveParseShape = {
  name: "@when",
  family: "action",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LBRACE",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  sections: ["when", "then"],
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
