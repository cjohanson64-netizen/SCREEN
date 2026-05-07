import type { Token, TokenType } from "../tokens/types.js";

export class Scanner {
  public readonly tokens: Token[] = [];
  private i = 0;
  private line = 1;
  private column = 1;

  constructor(public readonly source: string) {}

  get index(): number {
    return this.i;
  }

  get currentLine(): number {
    return this.line;
  }

  get currentColumn(): number {
    return this.column;
  }

  get isAtEnd(): boolean {
    return this.i >= this.source.length;
  }

  current(offset = 0): string {
    return this.source[this.i + offset] ?? "";
  }

  advance(count = 1): void {
    for (let j = 0; j < count; j++) {
      const ch = this.source[this.i];
      this.i += 1;
      if (ch === "\n") {
        this.line += 1;
        this.column = 1;
      } else {
        this.column += 1;
      }
    }
  }

  match(value: string): boolean {
    return this.source.startsWith(value, this.i);
  }

  addToken(
    type: TokenType,
    value: string,
    startLine = this.line,
    startColumn = this.column,
    startIndex = this.i,
  ): void {
    this.tokens.push({
      type,
      value,
      line: startLine,
      column: startColumn,
      index: startIndex,
    });
  }

  mark(): { line: number; column: number; index: number } {
    return {
      line: this.line,
      column: this.column,
      index: this.i,
    };
  }
}
