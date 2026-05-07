import type { DirectiveParseShape } from "../../grammar/types.js";

export const RuntimeGeneratenodeidDirectiveShape: DirectiveParseShape = {
  name: "@runtime.generateNodeId",
  family: "runtime",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
