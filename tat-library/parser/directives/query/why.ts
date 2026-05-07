import type { DirectiveParseShape } from "../../grammar/types.js";

export const WhyDirectiveShape: DirectiveParseShape = {
  name: "@why",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "statement",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
