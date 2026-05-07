import type { DirectiveParseShape } from "../../grammar/types.js";

export const ProjectDefineDirectiveShape: DirectiveParseShape = {
  name: "@project.define",
  family: "projection",
  startToken: "KEYWORD",
  primaryForm: "definition",
  opensWith: "LPAREN",
  closesWith: "RBRACE",
  introducesNewlineBody: true,
  notes: ["Defines a named reusable projection."],
};
