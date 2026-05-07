import type { DirectiveParseShape } from "../../grammar/types.js";

export const HowDirectiveShape: DirectiveParseShape = {
  name: "@how",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "statement",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
