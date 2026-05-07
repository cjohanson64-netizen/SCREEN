import type { DirectiveParseShape } from "../../grammar/types.js";

export const RuntimeDeletenodeDirectiveShape: DirectiveParseShape = {
  name: "@runtime.deleteNode",
  family: "runtime",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
