import { isDigit, isIdentStart, isWhitespace } from "../chars/classifiers.js";
import { Scanner } from "./Scanner.js";
import { TokenizeError } from "../errors/TokenizeError.js";
import {
  CLOSE_SYMBOLS,
  MULTI_CHAR_OPERATORS,
  MULTI_CHAR_SEPARATORS,
  OPEN_SYMBOLS,
  SINGLE_CHAR_OPERATORS,
  SINGLE_CHAR_SEPARATORS,
} from "../tokens/symbols/index.js";
import type { Token, TokenSpec } from "../tokens/types.js";
import {
  isRegexStart,
  readIdentifier,
  readKeyword,
  readNumber,
  readRegex,
  readString,
  skipLineComment,
} from "../readers/index.js";

function consumeSpec(scanner: Scanner, spec: TokenSpec): boolean {
  if (!scanner.match(spec.value)) return false;

  scanner.addToken(spec.type, spec.value);
  scanner.advance(spec.value.length);
  return true;
}

function consumeAnySpec(scanner: Scanner, specs: readonly TokenSpec[]): boolean {
  return specs.some((spec) => consumeSpec(scanner, spec));
}

export function tokenize(source: string): Token[] {
  const scanner = new Scanner(source);

  while (!scanner.isAtEnd) {
    const ch = scanner.current();

    if (isWhitespace(ch)) {
      scanner.advance();
      continue;
    }

    if (ch === "\n") {
      scanner.addToken("NEWLINE", "\n");
      scanner.advance();
      continue;
    }

    if (scanner.match("//")) {
      skipLineComment(scanner);
      continue;
    }

    if (consumeAnySpec(scanner, MULTI_CHAR_SEPARATORS)) continue;
    if (consumeAnySpec(scanner, MULTI_CHAR_OPERATORS)) continue;

    if (consumeAnySpec(scanner, SINGLE_CHAR_OPERATORS)) continue;
    if (consumeAnySpec(scanner, SINGLE_CHAR_SEPARATORS)) continue;
    if (consumeAnySpec(scanner, OPEN_SYMBOLS)) continue;
    if (consumeAnySpec(scanner, CLOSE_SYMBOLS)) continue;

    if (ch === "_") {
      scanner.addToken("WILDCARD", "_");
      scanner.advance();
      continue;
    }

    if (ch === '"' || ch === "'") {
      readString(scanner);
      continue;
    }

    if (ch === "@") {
      readKeyword(scanner);
      continue;
    }

    if (ch === "/") {
      if (isRegexStart(scanner)) {
        readRegex(scanner);
      } else {
        scanner.addToken("SLASH", "/");
        scanner.advance();
      }
      continue;
    }

    if (isDigit(ch)) {
      readNumber(scanner);
      continue;
    }

    if (isIdentStart(ch)) {
      readIdentifier(scanner);
      continue;
    }

    throw new TokenizeError(
      `Unexpected character "${ch}"`,
      scanner.currentLine,
      scanner.currentColumn,
      scanner.index,
    );
  }

  scanner.addToken("EOF", "");
  return scanner.tokens;
}
