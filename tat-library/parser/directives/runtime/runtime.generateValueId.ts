import type { DirectiveParseShape } from "../../grammar/types.js";

export const RuntimeGeneratevalueidDirectiveShape: DirectiveParseShape = {
  name: "@runtime.generateValueId",
  family: "runtime",
  startToken: "KEYWORD",
  primaryForm: "expression",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
