import * as vscode from "vscode";

import { createTatCompletionProvider } from "./completions";
import {
  clearTatDiagnostics,
  refreshTatDiagnostics,
} from "./diagnostics";
import { createTatHoverProvider } from "./hovers";

const TAT_LANGUAGE_ID = "tat";

export function activate(context: vscode.ExtensionContext): void {
  console.log("TAT language extension activated.");

  const diagnosticCollection =
    vscode.languages.createDiagnosticCollection(TAT_LANGUAGE_ID);

  context.subscriptions.push(diagnosticCollection);

  registerDiagnostics(context, diagnosticCollection);
  registerHoverProvider(context);
  registerCompletionProvider(context);
}

export function deactivate(): void {
  // Nothing to clean up manually. VSCode disposes subscriptions automatically.
}

function registerDiagnostics(
  context: vscode.ExtensionContext,
  diagnosticCollection: vscode.DiagnosticCollection,
): void {
  for (const document of vscode.workspace.textDocuments) {
    refreshTatDiagnostics(document, diagnosticCollection);
  }

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      refreshTatDiagnostics(document, diagnosticCollection);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      refreshTatDiagnostics(event.document, diagnosticCollection);
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      clearTatDiagnostics(document, diagnosticCollection);
    }),
  );
}

function registerHoverProvider(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      TAT_LANGUAGE_ID,
      createTatHoverProvider(),
    ),
  );
}

function registerCompletionProvider(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      TAT_LANGUAGE_ID,
      createTatCompletionProvider(),
      "@",
    ),
  );
}