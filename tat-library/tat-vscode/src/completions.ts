import * as vscode from "vscode";

import { TAT_DIRECTIVES } from "./directiveMetadata";

const DIRECTIVE_PREFIX_PATTERN = /@[a-zA-Z]*(?:\.[a-zA-Z]*)?$/;

export function createTatCompletionProvider(): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(document, position) {
      const replacementRange = getDirectiveReplacementRange(document, position);

      return TAT_DIRECTIVES.map((directive) => {
        const item = new vscode.CompletionItem(
          directive.name,
          vscode.CompletionItemKind.Function,
        );

        item.detail = "TAT directive";
        item.documentation = new vscode.MarkdownString(
          `**${directive.name}**\n\n${directive.description}`,
        );

        item.filterText = directive.name;

        if (directive.insertText) {
          item.insertText = new vscode.SnippetString(directive.insertText);
        } else {
          item.insertText = directive.name;
        }

        if (replacementRange) {
          item.range = replacementRange;
        }

        return item;
      });
    },
  };
}

function getDirectiveReplacementRange(
  document: vscode.TextDocument,
  position: vscode.Position,
): vscode.Range | undefined {
  const lineText = document.lineAt(position.line).text;
  const linePrefix = lineText.slice(0, position.character);
  const match = linePrefix.match(DIRECTIVE_PREFIX_PATTERN);

  if (!match) {
    return undefined;
  }

  const typedDirectivePrefix = match[0];
  const start = new vscode.Position(
    position.line,
    position.character - typedDirectivePrefix.length,
  );

  return new vscode.Range(start, position);
}