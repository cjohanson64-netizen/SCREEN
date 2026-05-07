import type { Token } from "../../lexer/tokenize.js";
import { ParseError } from "../core/ParseError.js";

export function createParseError(token: Token, message: string): ParseError {
  return new ParseError(message, token);
}
