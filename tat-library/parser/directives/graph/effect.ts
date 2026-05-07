import type { DirectiveParseShape } from "../../grammar/types.js";

export const EffectDirectiveShape: DirectiveParseShape = {
  name: "@effect",
  family: "graph",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LBRACE",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
