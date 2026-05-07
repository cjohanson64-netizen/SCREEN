import type { TokenType } from "../../lexer/tokenize.js";

export type ParserSymbolRole =
  | "open"
  | "close"
  | "separator"
  | "operator"
  | "terminal";

export interface ParserSymbolSpec {
  readonly id: string;
  readonly tokenType: TokenType;
  readonly lexeme: string;
  readonly role: ParserSymbolRole;
  readonly opens?: TokenType;
  readonly closes?: TokenType;
  readonly description: string;
}

export type DirectiveFamily =
  | "core"
  | "projection"
  | "graph"
  | "action"
  | "bind"
  | "ctx"
  | "runtime"
  | "graft"
  | "prune"
  | "derive"
  | "select";

export interface DirectiveParseShape {
  readonly name: string;
  readonly family: DirectiveFamily;
  readonly startToken: "KEYWORD";
  readonly primaryForm:
    | "block"
    | "call"
    | "pipeline-step"
    | "definition"
    | "expression"
    | "statement";
  readonly opensWith?: TokenType;
  readonly closesWith?: TokenType;
  readonly introducesNewlineBody?: boolean;
  readonly sections?: readonly string[];
  readonly notes?: readonly string[];
}
