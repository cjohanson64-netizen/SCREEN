import type { DirectiveParseShape } from "../../grammar/types.js";

export const WhereDirectiveShape: DirectiveParseShape = {
  name: "@where",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "statement",
  opensWith: "LBRACE",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
