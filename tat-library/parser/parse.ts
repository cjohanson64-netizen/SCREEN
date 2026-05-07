import type { Token } from "../lexer/tokenize.js";
import type { ProgramNode } from "../ast/nodeTypes.js";
import { Parser } from "./core/Parser.js";
export { Parser } from "./core/Parser.js";
export { ParseError } from "./core/ParseError.js";

export function parse(tokens: Token[]): ProgramNode {
  const parser = new Parser(tokens);
  return parser.parseProgram();
}
