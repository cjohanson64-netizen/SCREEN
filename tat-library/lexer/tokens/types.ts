export type TokenType =
  | "IDENT"
  | "KEYWORD"
  | "STRING"
  | "NUMBER"
  | "BOOLEAN"
  | "REGEX"
  | "WILDCARD"
  | "EQUALS"
  | "COLON_EQUALS"
  | "EQ2"
  | "EQ3"
  | "NEQ2"
  | "NEQ3"
  | "LTE"
  | "GTE"
  | "AND"
  | "OR"
  | "BANG"
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "PERCENT"
  | "DOT"
  | "DDOT"
  | "COLON"
  | "DCOLON"
  | "TCOLON"
  | "ARROW"
  | "INJECT_FLOW"
  | "PROJECT"
  | "LPAREN"
  | "RPAREN"
  | "LBRACKET"
  | "RBRACKET"
  | "LBRACE"
  | "RBRACE"
  | "LANGLE"
  | "RANGLE"
  | "COMMA"
  | "NEWLINE"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  index: number;
}

export interface TokenSpec {
  type: TokenType;
  value: string;
}
