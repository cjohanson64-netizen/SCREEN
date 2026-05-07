import type { DirectiveParseShape } from "../../grammar/types.js";

export const PruneMetaDirectiveShape: DirectiveParseShape = {
  name: "@prune.meta",
  family: "prune",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
