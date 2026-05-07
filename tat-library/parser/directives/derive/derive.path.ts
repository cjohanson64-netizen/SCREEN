import type { DirectiveParseShape } from "../../grammar/types.js";

export const DerivePathDirectiveShape: DirectiveParseShape = {
  name: "@derive.path",
  family: "derive",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LBRACE",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
