import * as vscode from "vscode";

import { tokenize, TokenizeError } from "../../lexer/tokenize";
import { parse, ParseError } from "../../parser/parse";
import { validateProgram } from "../../runtime/validateProgram";

type DeclaredNode = {
  name: string;
  index: number;
  line: number;
  column: number;
};

type TatAnalysis = {
  declaredNodes: Map<string, DeclaredNode>;
};

const VALID_DIRECTIVES = new Set([
  "@seed",
  "@match",
  "@path",
  "@where",
  "@query",
  "@why",
  "@how",
  "@project",
  "@projection",
  "@reduce",
  "@compose",
  "@graph",
  "@effect",
  "@action",
  "@loop",
  "@if",
  "@when",
  "@bind",
  "@bind.ctx",
  "@bind.ctx.node",
  "@bind.ctx.edge",
  "@bind.state",
  "@bind.state.node",
  "@bind.state.edge",
  "@bind.meta",
  "@bind.meta.node",
  "@bind.meta.edge",
  "@ctx",
  "@ctx.set",
  "@ctx.clear",
  "@runtime.addNode",
  "@runtime.updateNodeValue",
  "@runtime.deleteNode",
  "@runtime.generateValueId",
  "@runtime.generateNodeId",
  "@runtime.nextOrder",
  "@graft.branch",
  "@graft.state",
  "@graft.meta",
  "@graft.progress",
  "@prune.branch",
  "@prune.state",
  "@prune.meta",
  "@prune.nodes",
  "@prune.edges",
  "@derive.state",
  "@derive.meta",
  "@derive.count",
  "@derive.edgeCount",
  "@derive.exists",
  "@derive.path",
  "@derive.collect",
  "@derive.sum",
  "@derive.min",
  "@derive.max",
  "@derive.avg",
  "@derive.abs",
  "@select.node",
  "@select.targets",
  "@select.sources",
  "@select.first",
  "@select.one",
  "@apply",
]);

const DIRECTIVE_HOVERS = Object.fromEntries(
  Array.from(VALID_DIRECTIVES).map((directive) => [
    directive,
    new vscode.MarkdownString(getDirectiveHoverText(directive)),
  ]),
);

function getDirectiveHoverText(directive: string): string {
  const descriptions: Record<string, string> = {
    "@seed": "Creates the initial graph seed.",
    "@match": "Matches graph patterns or conditions.",
    "@path": "Evaluates or describes a path through the graph.",
    "@where": "Filters graph data by a condition.",
    "@query": "Queries graph relationships, state, or metadata.",
    "@why": "Explains why a graph relationship or result exists.",
    "@how": "Explains how a graph result was reached.",
    "@project": "Creates a projection from graph data.",
    "@projection": "Defines or references a projection.",
    "@reduce": "Reduces graph/query results into a single value.",
    "@compose": "Composes operations or graph transformations.",
    "@graph": "Declares or references a graph interaction.",
    "@effect": "Defines an effectful graph operation.",
    "@action": "Runs or declares an action.",
    "@loop": "Runs repeated graph logic.",
    "@if": "Runs conditional graph logic.",
    "@when": "Defines a conditional trigger.",
    "@bind": "Binds a result into context, state, or metadata.",
    "@bind.ctx": "Binds a value into context.",
    "@bind.ctx.node": "Binds a node result into context.",
    "@bind.ctx.edge": "Binds an edge result into context.",
    "@bind.state": "Binds a value into graph state.",
    "@bind.state.node": "Binds node state.",
    "@bind.state.edge": "Binds edge state.",
    "@bind.meta": "Binds a value into metadata.",
    "@bind.meta.node": "Binds node metadata.",
    "@bind.meta.edge": "Binds edge metadata.",
    "@ctx": "Reads or references runtime context.",
    "@ctx.set": "Sets a context value.",
    "@ctx.clear": "Clears a context value.",
    "@runtime.addNode": "Adds a node at runtime.",
    "@runtime.updateNodeValue": "Updates a node value at runtime.",
    "@runtime.deleteNode": "Deletes a node at runtime.",
    "@runtime.generateValueId": "Generates a runtime value id.",
    "@runtime.generateNodeId": "Generates a runtime node id.",
    "@runtime.nextOrder": "Gets the next runtime order value.",
    "@graft.branch": "Adds a structural relationship edge.",
    "@graft.state": "Adds or updates state.",
    "@graft.meta": "Adds or updates metadata.",
    "@graft.progress": "Adds or updates progression/history.",
    "@prune.branch": "Removes a branch/edge.",
    "@prune.state": "Removes state.",
    "@prune.meta": "Removes metadata.",
    "@prune.nodes": "Removes nodes.",
    "@prune.edges": "Removes edges.",
    "@derive.state": "Derives a state value.",
    "@derive.meta": "Derives a metadata value.",
    "@derive.count": "Derives a count.",
    "@derive.edgeCount": "Derives an edge count.",
    "@derive.exists": "Derives whether something exists.",
    "@derive.path": "Derives a path.",
    "@derive.collect": "Collects derived values.",
    "@derive.sum": "Derives a sum.",
    "@derive.min": "Derives a minimum value.",
    "@derive.max": "Derives a maximum value.",
    "@derive.avg": "Derives an average value.",
    "@derive.abs": "Derives an absolute value.",
    "@select.node": "Selects a node.",
    "@select.targets": "Selects target nodes from edges.",
    "@select.sources": "Selects source nodes from edges.",
    "@select.first": "Selects the first result.",
    "@select.one": "Selects exactly one result.",
    "@apply": "Applies an operation or transformation.",
  };

  return `**${directive}**\n\n${descriptions[directive] ?? "TAT directive."}`;
}

export function activate(context: vscode.ExtensionContext) {
  const diagnostics = vscode.languages.createDiagnosticCollection("tat");

  function lintDocument(document: vscode.TextDocument) {
    if (document.languageId !== "tat") return;

    const text = document.getText();
    const problems: vscode.Diagnostic[] = [];

    try {
      const tokens = tokenize(text);
      const program = parse(tokens);
      const issues = validateProgram(program);

      for (const issue of issues) {
        problems.push(validationIssueToDiagnostic(issue));
      }
    } catch (error) {
      problems.push(errorToDiagnostic(error));
    }

    diagnostics.set(document.uri, problems);
  }

  for (const document of vscode.workspace.textDocuments) {
    lintDocument(document);
  }

  context.subscriptions.push(
    diagnostics,

    vscode.workspace.onDidOpenTextDocument(lintDocument),

    vscode.workspace.onDidChangeTextDocument((event) =>
      lintDocument(event.document),
    ),

    vscode.workspace.onDidCloseTextDocument((document) =>
      diagnostics.delete(document.uri),
    ),

    vscode.languages.registerHoverProvider("tat", {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(
          position,
          /@[a-zA-Z_][a-zA-Z0-9_.]*/,
        );

        if (!range) return;

        const word = document.getText(range);
        const info = DIRECTIVE_HOVERS[word];

        if (!info) return;

        return new vscode.Hover(info);
      },
    }),

    vscode.languages.registerCompletionItemProvider(
      "tat",
      {
        provideCompletionItems(document, position) {
          const text = document.getText();
          const analysis = analyzeTatForEditorFeatures(text);

          const line = document.lineAt(position).text;
          const linePrefix = line.substring(0, position.character);

          if (linePrefix.trim().startsWith("@")) {
            return createDirectiveCompletionItems();
          }

          if (isInsideGraftBranchCall(document, position)) {
            return createNodeCompletionItems(analysis);
          }

          if (isInsideSeedNodesBlock(document, position)) {
            return createNodeCompletionItems(analysis);
          }

          if (isInsideNodeReferenceContext(document, position)) {
            return createNodeCompletionItems(analysis);
          }

          return [];
        },
      },
      "@",
      "(",
      "[",
      " ",
      ",",
    ),
  );
}

export function deactivate() {}

// -----------------------------
// Real TAT parser integration
// -----------------------------

function analyzeTatForEditorFeatures(text: string): TatAnalysis {
  try {
    const tokens = tokenize(text);
    const program = parse(tokens);

    return {
      declaredNodes: collectDeclaredNodesFromProgram(program),
    };
  } catch {
    return {
      declaredNodes: collectDeclaredNodesFallback(text),
    };
  }
}

function collectDeclaredNodesFromProgram(program: any): Map<string, DeclaredNode> {
  const nodes = new Map<string, DeclaredNode>();

  if (!program || !Array.isArray(program.body)) {
    return nodes;
  }

  for (const statement of program.body) {
    if (
      statement?.type === "ValueBinding" &&
      statement?.value?.type === "NodeCapture"
    ) {
      const name = statement.name?.name;

      if (typeof name === "string") {
        nodes.set(name, {
          name,
          index: statement.name?.span?.start ?? statement.span?.start ?? 0,
          line: statement.name?.span?.line ?? statement.span?.line ?? 1,
          column: statement.name?.span?.column ?? statement.span?.column ?? 1,
        });
      }
    }
  }

  return nodes;
}

function collectDeclaredNodesFallback(text: string): Map<string, DeclaredNode> {
  const nodes = new Map<string, DeclaredNode>();
  const regex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*<\{\}>\s*$/gm;

  for (const match of text.matchAll(regex)) {
    const name = match[1];

    nodes.set(name, {
      name,
      index: match.index,
      ...getLineColumnFromIndex(text, match.index),
    });
  }

  return nodes;
}

// -----------------------------
// Diagnostics
// -----------------------------

function validationIssueToDiagnostic(issue: {
  severity: "error" | "warning";
  message: string;
  span?: { line: number; column: number };
}): vscode.Diagnostic {
  const line = Math.max((issue.span?.line ?? 1) - 1, 0);
  const column = Math.max((issue.span?.column ?? 1) - 1, 0);

  return new vscode.Diagnostic(
    new vscode.Range(line, column, line, column + 1),
    issue.message,
    issue.severity === "error"
      ? vscode.DiagnosticSeverity.Error
      : vscode.DiagnosticSeverity.Warning,
  );
}

function errorToDiagnostic(error: unknown): vscode.Diagnostic {
  if (error instanceof TokenizeError) {
    return new vscode.Diagnostic(
      new vscode.Range(
        Math.max(error.line - 1, 0),
        Math.max(error.column - 1, 0),
        Math.max(error.line - 1, 0),
        Math.max(error.column, 1),
      ),
      error.message,
      vscode.DiagnosticSeverity.Error,
    );
  }

  if (error instanceof ParseError) {
    const token = error.token;

    return new vscode.Diagnostic(
      new vscode.Range(
        Math.max(token.line - 1, 0),
        Math.max(token.column - 1, 0),
        Math.max(token.line - 1, 0),
        Math.max(token.column - 1 + token.value.length, token.column),
      ),
      error.message,
      vscode.DiagnosticSeverity.Error,
    );
  }

  if (error instanceof Error) {
    return new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 1),
      error.message,
      vscode.DiagnosticSeverity.Error,
    );
  }

  return new vscode.Diagnostic(
    new vscode.Range(0, 0, 0, 1),
    "Unknown TAT parser error",
    vscode.DiagnosticSeverity.Error,
  );
}

// -----------------------------
// Completion helpers
// -----------------------------

function createDirectiveCompletionItems(): vscode.CompletionItem[] {
  return Array.from(VALID_DIRECTIVES).map((directive) => {
    const item = new vscode.CompletionItem(
      directive,
      vscode.CompletionItemKind.Keyword,
    );

    item.detail = "TAT directive";
    item.documentation = DIRECTIVE_HOVERS[directive];
    item.insertText = directive;

    return item;
  });
}

function createNodeCompletionItems(
  analysis: TatAnalysis,
): vscode.CompletionItem[] {
  return Array.from(analysis.declaredNodes.keys()).map((nodeName) => {
    const item = new vscode.CompletionItem(
      nodeName,
      vscode.CompletionItemKind.Variable,
    );

    item.detail = "TAT node";
    item.documentation = new vscode.MarkdownString(
      `Declared node: \`${nodeName}\``,
    );

    return item;
  });
}

function isInsideSeedNodesBlock(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position),
  );

  const lastNodesOpen = textBeforeCursor.lastIndexOf("nodes:");
  if (lastNodesOpen === -1) return false;

  const textSinceNodes = textBeforeCursor.slice(lastNodesOpen);

  const openBracketIndex = textSinceNodes.indexOf("[");
  const closeBracketIndex = textSinceNodes.indexOf("]");

  return openBracketIndex !== -1 && closeBracketIndex === -1;
}

function isInsideGraftBranchCall(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position),
  );

  const lastGraft = textBeforeCursor.lastIndexOf("@graft.branch(");
  if (lastGraft === -1) return false;

  const textSince = textBeforeCursor.slice(lastGraft);

  return textSince.includes("(") && !textSince.includes(")");
}

function isInsideNodeReferenceContext(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  const line = document.lineAt(position).text;
  const linePrefix = line.substring(0, position.character);

  return (
    /\bnode\s*:\s*$/.test(linePrefix) ||
    /\broot\s*:\s*$/.test(linePrefix) ||
    /@select\.node\s*\(\s*$/.test(linePrefix) ||
    /@apply\s*\(\s*$/.test(linePrefix)
  );
}

// -----------------------------
// Utility helpers
// -----------------------------

function getLineColumnFromIndex(
  text: string,
  index: number,
): { line: number; column: number } {
  const before = text.slice(0, index);
  const lines = before.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}