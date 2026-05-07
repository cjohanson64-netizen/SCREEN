import type { DirectiveParseShape } from "../../grammar/types.js";

export const GraftMetaDirectiveShape: DirectiveParseShape = {
  name: "@graft.meta",
  family: "graft",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
