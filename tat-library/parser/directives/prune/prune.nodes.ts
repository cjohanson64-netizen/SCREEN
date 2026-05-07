import type { DirectiveParseShape } from "../../grammar/types.js";

export const PruneNodesDirectiveShape: DirectiveParseShape = {
  name: "@prune.nodes",
  family: "prune",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
