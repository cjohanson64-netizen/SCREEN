import type { DirectiveParseShape } from "../../grammar/types.js";

export const GraphDirectiveShape: DirectiveParseShape = {
  name: "@graph",
  family: "graph",
  startToken: "KEYWORD",
  primaryForm: "definition",
  notes: ["Parser-shape descriptor; runtime behavior lives outside parser."],
};
