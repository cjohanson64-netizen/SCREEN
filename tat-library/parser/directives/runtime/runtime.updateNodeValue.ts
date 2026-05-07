import type { DirectiveParseShape } from "../../grammar/types.js";

export const RuntimeUpdatenodevalueDirectiveShape: DirectiveParseShape = {
  name: "@runtime.updateNodeValue",
  family: "runtime",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
