import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

interface FileMetrics {
  file: string;
  loc: number;
  functions: number;
  imports: number;
  switches: number;
  cases: number;
  ifs: number;
  directiveRefs: number;
  maxBraceDepth: number;
  legacyHits: Record<string, number>;
}

const SOURCE_EXTENSIONS = new Set([".ts", ".js"]);
const DEFAULT_IGNORES = new Set(["node_modules", "dist", ".git"]);

const LEGACY_PATTERNS: Array<[string, RegExp]> = [
  ["@apply", /@apply\b/g],
  ["@projection", /@projection\b/g],
  ["@project(", /@project\s*\(/g],
  ["@action(", /@action\s*\(/g],
  ["@query(", /@query\s*\(/g],
  ["@match(", /@match\s*\(/g],
  ["@path(", /@path\s*\(/g],
  ["@bind.", /@bind\./g],
  ["@ctx.set", /@ctx\.set\b/g],
  ["@ctx.clear", /@ctx\.clear\b/g],
  ["pipeline:", /pipeline\s*:/g],
  ["@loop", /@loop\b/g],
];

function walk(dir: string, root = dir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (DEFAULT_IGNORES.has(entry)) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      files.push(...walk(full, root));
      continue;
    }

    if (!stats.isFile()) continue;
    if (![".ts", ".js"].some((ext) => full.endsWith(ext))) continue;
    files.push(relative(root, full));
  }
  return files.sort();
}

function countMatches(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0;
}

function maxBraceDepth(source: string): number {
  let depth = 0;
  let max = 0;
  let inString: 'single' | 'double' | 'template' | null = null;
  let escaped = false;

  for (const ch of source) {
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (
        (inString === "single" && ch === "'") ||
        (inString === "double" && ch === '"') ||
        (inString === "template" && ch === "`")
      ) {
        inString = null;
      }
      continue;
    }

    if (ch === "'") {
      inString = "single";
      continue;
    }
    if (ch === '"') {
      inString = "double";
      continue;
    }
    if (ch === "`") {
      inString = "template";
      continue;
    }

    if (ch === "{") {
      depth += 1;
      max = Math.max(max, depth);
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
    }
  }

  return max;
}

function metricsFor(file: string, source: string): FileMetrics {
  const legacyHits: Record<string, number> = {};
  for (const [label, pattern] of LEGACY_PATTERNS) {
    const count = countMatches(source, pattern);
    if (count) legacyHits[label] = count;
  }

  return {
    file,
    loc: source.split(/\r?\n/).filter((line) => line.trim().length > 0).length,
    functions: countMatches(source, /\b(function\s+\w+|export\s+function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g),
    imports: countMatches(source, /^import\s/mg),
    switches: countMatches(source, /\bswitch\s*\(/g),
    cases: countMatches(source, /\bcase\s+/g),
    ifs: countMatches(source, /\bif\s*\(/g),
    directiveRefs: countMatches(source, /@[a-zA-Z][\w.]*/g),
    maxBraceDepth: maxBraceDepth(source),
    legacyHits,
  };
}

function formatTable(rows: string[][]): string {
  if (!rows.length) return "";
  const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => row[col]?.length ?? 0)));
  return rows
    .map((row, index) => {
      const line = row.map((cell, col) => cell.padEnd(widths[col])).join(" | ");
      if (index === 0) {
        return `${line}\n${widths.map((width) => "-".repeat(width)).join(" | ")}`;
      }
      return line;
    })
    .join("\n");
}

function warningCount(file: FileMetrics): number {
  return [
    file.loc > 900,
    file.functions > 35,
    file.imports > 25,
    file.cases > 80,
    file.maxBraceDepth > 8,
    Object.keys(file.legacyHits).length > 0,
  ].filter(Boolean).length;
}

function makeReport(metrics: FileMetrics[]): string {
  const totalLoc = metrics.reduce((sum, file) => sum + file.loc, 0);
  const legacyTotals = new Map<string, number>();
  for (const file of metrics) {
    for (const [pattern, count] of Object.entries(file.legacyHits)) {
      legacyTotals.set(pattern, (legacyTotals.get(pattern) ?? 0) + count);
    }
  }

  const largest = [...metrics].sort((a, b) => b.loc - a.loc).slice(0, 15);
  const risky = [...metrics].sort((a, b) => warningCount(b) - warningCount(a) || b.loc - a.loc).slice(0, 15);
  const coupled = [...metrics].sort((a, b) => b.imports - a.imports).slice(0, 15);

  const legacyRows = [...legacyTotals.entries()].sort((a, b) => b[1] - a[1]);
  const legacyFiles = metrics.filter((file) => Object.keys(file.legacyHits).length > 0);

  return [
    "# TAT Phase 8.2 Code Health Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Snapshot",
    "",
    `- Source files scanned: ${metrics.length}`,
    `- Approximate non-empty LOC: ${totalLoc.toLocaleString()}`,
    `- Files over 900 LOC: ${metrics.filter((file) => file.loc > 900).length}`,
    `- Files with legacy-pattern hits: ${legacyFiles.length}`,
    "",
    "## Largest files",
    "",
    "```txt",
    formatTable([
      ["File", "LOC", "Fns", "Imports", "Switch", "Case", "If", "Depth", "@refs"],
      ...largest.map((file) => [
        file.file,
        String(file.loc),
        String(file.functions),
        String(file.imports),
        String(file.switches),
        String(file.cases),
        String(file.ifs),
        String(file.maxBraceDepth),
        String(file.directiveRefs),
      ]),
    ]),
    "```",
    "",
    "## Highest warning density",
    "",
    "```txt",
    formatTable([
      ["File", "Warnings", "LOC", "Fns", "Imports", "Cases", "Depth", "Legacy"],
      ...risky.map((file) => [
        file.file,
        String(warningCount(file)),
        String(file.loc),
        String(file.functions),
        String(file.imports),
        String(file.cases),
        String(file.maxBraceDepth),
        Object.entries(file.legacyHits).map(([k, v]) => `${k}:${v}`).join(", ") || "-",
      ]),
    ]),
    "```",
    "",
    "## Import coupling hot spots",
    "",
    "```txt",
    formatTable([
      ["File", "Imports", "LOC"],
      ...coupled.map((file) => [file.file, String(file.imports), String(file.loc)]),
    ]),
    "```",
    "",
    "## Legacy-pattern totals",
    "",
    legacyRows.length
      ? "```txt\n" + formatTable([["Pattern", "Hits"], ...legacyRows.map(([pattern, count]) => [pattern, String(count)])]) + "\n```"
      : "No legacy-pattern hits found.",
    "",
    "## Legacy-pattern files",
    "",
    legacyFiles.length
      ? "```txt\n" + formatTable([
          ["File", "Hits"],
          ...legacyFiles.map((file) => [
            file.file,
            Object.entries(file.legacyHits).map(([k, v]) => `${k}:${v}`).join(", "),
          ]),
        ]) + "\n```"
      : "No legacy-pattern files found.",
    "",
    "## Recommended next refactor targets",
    "",
    "1. Split `parser/directives/parserDirectiveParsers.ts` into semantic directive slices.",
    "2. Split `runtime/execute/action.ts` into action execution, value evaluation, aggregation, and utility modules.",
    "3. Split `runtime/validation/expressions/expressionValidators.ts` by pipeline/mutation/control/value validators.",
    "4. Review legacy-pattern files and keep legacy strings only in migration diagnostics/docs.",
    "",
  ].join("\n");
}

function main(): void {
  const root = process.argv[2] ?? process.cwd();
  const outArgIndex = process.argv.findIndex((arg) => arg === "--out");
  const outPath = outArgIndex >= 0 ? process.argv[outArgIndex + 1] : null;
  const files = walk(root);
  const metrics = files.map((file) => metricsFor(file, readFileSync(join(root, file), "utf8")));
  const report = makeReport(metrics);

  if (outPath) {
    writeFileSync(outPath, report);
    console.log(`Wrote code health report to ${outPath}`);
    return;
  }

  console.log(report);
}

main();
