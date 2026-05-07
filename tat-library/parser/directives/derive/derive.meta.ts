import type { DirectiveParseShape } from "../../grammar/types.js";

export const DeriveMetaDirectiveShape: DirectiveParseShape = {
  name: "@derive.meta",
  family: "derive",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
