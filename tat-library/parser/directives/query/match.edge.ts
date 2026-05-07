import type { DirectiveParseShape } from "../../grammar/types.js";

export const MatchEdgeDirectiveShape: DirectiveParseShape = {
  name: "@match.edge",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "statement",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Matches an edge pattern."],
};
