import type { DirectiveParseShape } from "../../grammar/types.js";

export const ActionDefineDirectiveShape: DirectiveParseShape = {
  name: "@action.define",
  family: "action",
  startToken: "KEYWORD",
  primaryForm: "definition",
  opensWith: "LPAREN",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  notes: ["Defines a named action with when/do/project sections."],
};
