import type { DirectiveParseShape } from "../../grammar/types.js";

export const ProjectApplyDirectiveShape: DirectiveParseShape = {
  name: "@project.apply",
  family: "projection",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Applies a named projection through projection flow."],
};
