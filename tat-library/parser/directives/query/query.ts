import type { DirectiveParseShape } from "../../grammar/types.js";

export const QueryEdgeDirectiveShape: DirectiveParseShape = {
  name: "@query.edge",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Checks edge existence."],
};

export const QueryStateDirectiveShape: DirectiveParseShape = {
  name: "@query.state",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Checks state equality."],
};

export const QueryMetaDirectiveShape: DirectiveParseShape = {
  name: "@query.meta",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Checks metadata equality."],
};
