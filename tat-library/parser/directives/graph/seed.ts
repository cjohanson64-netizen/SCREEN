import type { DirectiveParseShape } from "../../grammar/types.js";

export const SeedDirectiveShape: DirectiveParseShape = {
  name: "@seed",
  family: "core",
  startToken: "KEYWORD",
  primaryForm: "block",
  opensWith: "COLON",
  introducesNewlineBody: true,
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
