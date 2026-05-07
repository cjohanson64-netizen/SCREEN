import type { DirectiveParseShape } from "../../grammar/types.js";

export const ActionApplyDirectiveShape: DirectiveParseShape = {
  name: "@action.apply",
  family: "action",
  startToken: "KEYWORD",
  primaryForm: "pipeline-step",
  opensWith: "LPAREN",
  closesWith: "RPAREN",
  notes: ["Invokes a named action from a pipeline."],
};
