import { isKeywordPart } from "../chars/classifiers.js";
import type { Scanner } from "../core/Scanner.js";
import { TokenizeError } from "../errors/TokenizeError.js";
import { KEYWORDS } from "../tokens/directives/index.js";

export function readKeyword(scanner: Scanner): void {
  const start = scanner.mark();

  let value = "";

  while (isKeywordPart(scanner.current())) {
    value += scanner.current();
    scanner.advance();
  }

  if (!KEYWORDS.has(value)) {
    throw new TokenizeError(
      `Unknown keyword "${value}"`,
      start.line,
      start.column,
      start.index,
    );
  }

  scanner.addToken("KEYWORD", value, start.line, start.column, start.index);
}
