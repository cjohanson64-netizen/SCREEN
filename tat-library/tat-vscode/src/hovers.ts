import * as vscode from "vscode";

import { getDirectiveMetadata } from "./directiveMetadata";

const DIRECTIVE_PATTERN = /@[a-zA-Z]+(?:\.[a-zA-Z]+)*/;

export function createTatHoverProvider(): vscode.HoverProvider {
  return {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, DIRECTIVE_PATTERN);

      if (!range) {
        return undefined;
      }

      const directive = document.getText(range);
      const metadata = getDirectiveMetadata(directive);

      if (!metadata) {
        return undefined;
      }

      return new vscode.Hover(
        new vscode.MarkdownString(
          `**${metadata.name}**\n\n${metadata.description}`,
        ),
        range,
      );
    },
  };
}