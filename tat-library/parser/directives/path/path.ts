import type { DirectiveParseShape } from "../../grammar/types.js";

export const PathDirectiveShape: DirectiveParseShape = {
  name: "@path",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "statement",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
