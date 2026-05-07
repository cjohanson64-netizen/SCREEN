import type { DirectiveParseShape } from "../../grammar/types.js";

export const RuntimeAddnodeDirectiveShape: DirectiveParseShape = {
  name: "@runtime.addNode",
  family: "runtime",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
