import * as vscode from "vscode";

import { VALID_DIRECTIVES } from "./directiveMetadata";

const DIRECTIVE_PATTERN = /@[a-zA-Z]+(?:\.[a-zA-Z]+)*/g;
const LEGACY_BIND_FAMILY_PATTERN =
  /@bind\.(?:ctx|state|meta)(?:\.(?:node|edge))?\b/g;
const LEGACY_CTX_PATTERN = /@ctx\.(set|clear)\b/g;
const UNSUPPORTED_QUERY_VARIANT_PATTERN = /@query\.(exists|relation|node)\b/g;
const UNSUPPORTED_PATH_VARIANT_PATTERN = /@path\.(exists|find|all)\b/g;
const RETIRED_DIRECTIVES = new Set([
  "@projection",
  "@apply",
  "@bind.ctx",
  "@bind.ctx.node",
  "@bind.ctx.edge",
  "@bind.state",
  "@bind.state.node",
  "@bind.state.edge",
  "@bind.meta",
  "@bind.meta.node",
  "@bind.meta.edge",
  "@ctx.set",
  "@ctx.clear",
  "@query.exists",
  "@query.relation",
  "@query.node",
  "@path.exists",
  "@path.find",
  "@path.all",
]);

export function refreshTatDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): void {
  if (document.languageId !== "tat") {
    return;
  }

  const diagnostics = validateTatDocument(document);
  collection.set(document.uri, diagnostics);
}

export function clearTatDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): void {
  if (document.languageId !== "tat") {
    return;
  }

  collection.delete(document.uri);
}

function validateTatDocument(document: vscode.TextDocument): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();

  collectPhase7RetiredSyntaxDiagnostics(document, diagnostics);
  collectCanonicalSyntaxDiagnostics(document, diagnostics);
  collectUnknownDirectiveDiagnostics(document, text, diagnostics);

  return diagnostics;
}


function collectCanonicalSyntaxDiagnostics(
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
): void {
  for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber += 1) {
    const line = document.lineAt(lineNumber).text;

    const unboundSeedMatch = /^\s*@seed\s*\{/.exec(line);
    if (unboundSeedMatch) {
      addDiagnostic(
        lineNumber,
        line.indexOf("@seed", unboundSeedMatch.index),
        line.indexOf("@seed", unboundSeedMatch.index) + "@seed".length,
        "Prefer binding seeded graph results with ':=', e.g. graphName := @seed { ... }.",
        diagnostics,
      );
    }

    const legacySeedColonMatch = /^\s*@seed\s*:/.exec(line);
    if (legacySeedColonMatch) {
      addDiagnostic(
        lineNumber,
        line.indexOf("@seed", legacySeedColonMatch.index),
        line.indexOf("@seed", legacySeedColonMatch.index) + "@seed".length,
        "Legacy @seed: blocks are no longer canonical. Use graphName := @seed { ... }.",
        diagnostics,
      );
    }

    const legacyProjectionMatch = /@projection\b/.exec(line);
    if (legacyProjectionMatch) {
      addDiagnostic(
        lineNumber,
        legacyProjectionMatch.index,
        legacyProjectionMatch.index + "@projection".length,
        "@projection is no longer canonical. Use @project.define(Name, focus) { ... }.",
        diagnostics,
      );
    }

    const legacyProjectApplyMatch = /@project\s*\(/.exec(line);
    if (legacyProjectApplyMatch) {
      addDiagnostic(
        lineNumber,
        legacyProjectApplyMatch.index,
        legacyProjectApplyMatch.index + "@project".length,
        "@project(...) is no longer canonical. Use @project.apply(...), usually with projection flow '<>'.",
        diagnostics,
      );
    }

    const legacyActionDefineMatch = /@action\s*\(/.exec(line);
    if (legacyActionDefineMatch) {
      addDiagnostic(
        lineNumber,
        legacyActionDefineMatch.index,
        legacyActionDefineMatch.index + "@action".length,
        "@action(...) is no longer canonical. Use @action.define(actionName) { ... }.",
        diagnostics,
      );
    }

    const legacyApplyMatch = /@apply\s*\(/.exec(line);
    if (legacyApplyMatch) {
      addDiagnostic(
        lineNumber,
        legacyApplyMatch.index,
        legacyApplyMatch.index + "@apply".length,
        "@apply(...) is no longer canonical. Use @action.apply(actionName).",
        diagnostics,
      );
    }

    const legacyEffectCallMatch = /@effect\s*\(/.exec(line);
    if (legacyEffectCallMatch) {
      addDiagnostic(
        lineNumber,
        legacyEffectCallMatch.index,
        legacyEffectCallMatch.index + "@effect".length,
        "@effect(target, ops) is no longer canonical. Use @effect { -> ... }.",
        diagnostics,
      );
    }

    const pipelineKeyMatch = /\bpipeline\s*:/.exec(line);
    if (pipelineKeyMatch) {
      addDiagnostic(
        lineNumber,
        pipelineKeyMatch.index,
        pipelineKeyMatch.index + "pipeline".length,
        "Executable pipeline bodies no longer use 'pipeline:'. Put steps directly in the body and start each step with '->'.",
        diagnostics,
      );
    }
  }
}

function collectPhase7RetiredSyntaxDiagnostics(
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
): void {
  let previousNonEmptyLine = "";

  for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber += 1) {
    const line = document.lineAt(lineNumber).text;
    const trimmedLine = line.trim();

    collectMatches(
      line,
      LEGACY_BIND_FAMILY_PATTERN,
      lineNumber,
      diagnostics,
      "Legacy @bind.* forms are no longer canonical. Use @bind(refName) { expression } for semantic aliases, or @graft.state/@graft.meta for graph mutation.",
    );

    collectLegacyBindArgumentDiagnostics(line, lineNumber, diagnostics);
    collectLegacyCtxDiagnostics(line, lineNumber, diagnostics);
    collectPipelineCtxDiagnostics(line, lineNumber, diagnostics);
    collectLegacyQueryDiagnostics(line, lineNumber, diagnostics);
    collectLegacyPathDiagnostics(line, lineNumber, diagnostics);
    collectInjectAliasDiagnostics(
      line,
      previousNonEmptyLine,
      lineNumber,
      diagnostics,
    );
    collectAssignmentNormalizationDiagnostics(line, lineNumber, diagnostics);

    if (trimmedLine.length > 0) {
      previousNonEmptyLine = trimmedLine;
    }
  }
}

function collectLegacyBindArgumentDiagnostics(
  line: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  for (const match of line.matchAll(/@bind\s*\(([^)]*)\)/g)) {
    const args = match[1] ?? "";

    if (!/[:]?=/.test(args) && !args.includes(",")) {
      continue;
    }

    const start = match.index ?? 0;
    addDiagnostic(
      lineNumber,
      start,
      start + match[0].length,
      "@bind now uses block syntax: @bind(refName) { expression }.",
      diagnostics,
    );
  }
}

function collectLegacyCtxDiagnostics(
  line: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  for (const match of line.matchAll(LEGACY_CTX_PATTERN)) {
    const directive = match[0];
    const start = match.index ?? 0;
    const message =
      directive === "@ctx.set"
        ? "@ctx.set is no longer canonical. Use @ctx(nodeRef) only in graph bridge syntax, or @graft.state/@graft.meta for graph mutation."
        : "@ctx.clear is no longer canonical. Use @ctx(nodeRef) only in graph bridge syntax, or @prune.state/@prune.meta for graph cleanup.";

    addDiagnostic(
      lineNumber,
      start,
      start + directive.length,
      message,
      diagnostics,
    );
  }
}

function collectPipelineCtxDiagnostics(
  line: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  const match = /->\s*@ctx\s*\(/.exec(line);

  if (!match) {
    return;
  }

  const directiveStart = line.indexOf("@ctx", match.index);

  addDiagnostic(
    lineNumber,
    directiveStart,
    directiveStart + "@ctx".length,
    "@ctx(nodeRef) is only valid as bridge-local graph context, e.g. @graph(g1) : @ctx(node) :: @graph(g2).",
    diagnostics,
  );
}

function collectLegacyQueryDiagnostics(
  line: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  collectMatches(
    line,
    UNSUPPORTED_QUERY_VARIANT_PATTERN,
    lineNumber,
    diagnostics,
    "Unsupported @query variant. Canonical Phase 7 variants are @query.edge, @query.state, and @query.meta.",
  );

  const bareQueryMatch = /@query\s*\(/.exec(line);

  if (bareQueryMatch) {
    addDiagnostic(
      lineNumber,
      bareQueryMatch.index,
      bareQueryMatch.index + "@query".length,
      "Legacy @query object-wrapper syntax is no longer canonical. Use @query.edge(subject, relation, object), @query.state(node, key, value), or @query.meta(node, key, value).",
      diagnostics,
    );
  }
}

function collectLegacyPathDiagnostics(
  line: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  collectMatches(
    line,
    UNSUPPORTED_PATH_VARIANT_PATTERN,
    lineNumber,
    diagnostics,
    "Unsupported @path variant. Canonical Phase 7 variants are @path.has, @path.first, @path.count, and @path.through.",
  );

  for (const match of line.matchAll(
    /@path\.(?:has|first|count|through)\s*\([^)]*,\s*\{/g,
  )) {
    const start = match.index ?? 0;

    addDiagnostic(
      lineNumber,
      start,
      start + match[0].length,
      "Legacy @path options-in-arguments syntax is no longer canonical. Use @path.has(start, target) { relation, direction, depth }.",
      diagnostics,
    );
  }
}

function collectInjectAliasDiagnostics(
  line: string,
  previousNonEmptyLine: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  const injectMatch = /<-\s*@inject\s*\((.*)\)/.exec(line);

  if (!injectMatch || !hasThirdInjectArg(injectMatch[1] ?? "")) {
    return;
  }

  const appearsIndentedAsGraphFlowStep = /^\s+<-\s*@inject\s*\(/.test(line);
  const followsGraphPipeline = /@seed|->|:=/.test(previousNonEmptyLine);

  if (!appearsIndentedAsGraphFlowStep && !followsGraphPipeline) {
    return;
  }

  const directiveStart = line.indexOf("@inject", injectMatch.index);

  addDiagnostic(
    lineNumber,
    directiveStart,
    directiveStart + "@inject".length,
    "Injection aliases are only supported for top-level @inject in Phase 7. Graph-flow @inject may not create aliases.",
    diagnostics,
  );
}

function collectAssignmentNormalizationDiagnostics(
  line: string,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
): void {
  const staticWithSemanticOperatorMatch =
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:=\s*(?:<\s*\{|\[|"(?:[^"\\]|\\.)*"|\d+(?:\.\d+)?|true\b|false\b)/.exec(
      line,
    );

  if (staticWithSemanticOperatorMatch) {
    const operatorStart = line.indexOf(":=", staticWithSemanticOperatorMatch.index);

    addDiagnostic(
      lineNumber,
      operatorStart,
      operatorStart + 2,
      "Static authored declarations use '='. Reserve ':=' for evaluated semantic results.",
      diagnostics,
    );
  }

  const semanticWithStaticOperatorMatch =
    /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(?:@seed\b|@compose\b|@query\.|@path\.|@choose\b|@derive\.|@compute\.|@select\.|.*<>\s*@project\b)/.exec(
      line,
    );

  if (!semanticWithStaticOperatorMatch) {
    return;
  }

  const operatorStart = line.indexOf("=", semanticWithStaticOperatorMatch.index);

  addDiagnostic(
    lineNumber,
    operatorStart,
    operatorStart + 1,
    "Evaluated semantic results use ':='. Reserve '=' for authored static material.",
    diagnostics,
  );
}

function collectMatches(
  line: string,
  pattern: RegExp,
  lineNumber: number,
  diagnostics: vscode.Diagnostic[],
  message: string,
): void {
  pattern.lastIndex = 0;

  for (const match of line.matchAll(pattern)) {
    const start = match.index ?? 0;

    addDiagnostic(
      lineNumber,
      start,
      start + match[0].length,
      message,
      diagnostics,
    );
  }
}

function addDiagnostic(
  lineNumber: number,
  startCharacter: number,
  endCharacter: number,
  message: string,
  diagnostics: vscode.Diagnostic[],
): void {
  diagnostics.push(
    new vscode.Diagnostic(
      new vscode.Range(lineNumber, startCharacter, lineNumber, endCharacter),
      message,
      vscode.DiagnosticSeverity.Warning,
    ),
  );
}

function hasThirdInjectArg(callText: string): boolean {
  let commaCount = 0;
  let inString: string | undefined;
  let escaped = false;
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (const character of callText) {
    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === "\\") {
      escaped = true;
      continue;
    }

    if (inString) {
      if (character === inString) {
        inString = undefined;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      inString = character;
      continue;
    }

    if (character === "(") {
      parenDepth += 1;
      continue;
    }

    if (character === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }

    if (character === "{") {
      braceDepth += 1;
      continue;
    }

    if (character === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (character === "[") {
      bracketDepth += 1;
      continue;
    }

    if (character === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }

    if (
      character === "," &&
      parenDepth === 0 &&
      braceDepth === 0 &&
      bracketDepth === 0
    ) {
      commaCount += 1;
    }
  }

  return commaCount >= 2;
}

function collectUnknownDirectiveDiagnostics(
  document: vscode.TextDocument,
  text: string,
  diagnostics: vscode.Diagnostic[],
): void {
  for (const match of text.matchAll(DIRECTIVE_PATTERN)) {
    const directive = match[0];

    if (RETIRED_DIRECTIVES.has(directive)) {
      continue;
    }

    if (VALID_DIRECTIVES.has(directive)) {
      continue;
    }

    const index = match.index ?? 0;
    const start = document.positionAt(index);
    const end = document.positionAt(index + directive.length);

    diagnostics.push(
      new vscode.Diagnostic(
        new vscode.Range(start, end),
        `Unknown TAT directive "${directive}".`,
        vscode.DiagnosticSeverity.Warning,
      ),
    );
  }
}
