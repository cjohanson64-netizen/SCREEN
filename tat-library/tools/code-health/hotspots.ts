import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

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

interface RankedHotspot {
  rank: number;
  file: string;
  score: number;
  reasons: string[];
  recommendation: string;
  metrics: FileMetrics;
}

interface TimingSnapshot {
  fixture: string;
  totalMs: number | null;
  entries: Array<{ name: string; durationMs: number; count: number }>;
  error?: string;
}

const SOURCE_EXTENSIONS = new Set([".ts", ".js"]);
const DEFAULT_IGNORES = new Set(["node_modules", "dist", ".git"]);
const DEFAULT_TIMING_FIXTURES = [
  "tests/all-directives-expanded.tat",
  "tests/semantic-directives-demo.tat",
  "tests/phase7/import-compose-main.tat",
];

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
    if (!SOURCE_EXTENSIONS.has(extname(full))) continue;

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
  let inString: "single" | "double" | "template" | null = null;
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
    functions: countMatches(
      source,
      /\b(function\s+\w+|export\s+function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g,
    ),
    imports: countMatches(source, /^import\s/mg),
    switches: countMatches(source, /\bswitch\s*\(/g),
    cases: countMatches(source, /\bcase\s+/g),
    ifs: countMatches(source, /\bif\s*\(/g),
    directiveRefs: countMatches(source, /@[a-zA-Z][\w.]*/g),
    maxBraceDepth: maxBraceDepth(source),
    legacyHits,
  };
}

function scoreFile(file: FileMetrics): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (file.loc > 900) {
    score += 30;
    reasons.push(`oversized file (${file.loc} LOC)`);
  } else if (file.loc > 600) {
    score += 18;
    reasons.push(`large file (${file.loc} LOC)`);
  } else if (file.loc > 400) {
    score += 10;
    reasons.push(`moderately large file (${file.loc} LOC)`);
  }

  if (file.functions > 35) {
    score += 20;
    reasons.push(`high function count (${file.functions})`);
  } else if (file.functions > 20) {
    score += 10;
    reasons.push(`moderate function count (${file.functions})`);
  }

  if (file.imports > 25) {
    score += 18;
    reasons.push(`high import coupling (${file.imports})`);
  } else if (file.imports > 12) {
    score += 8;
    reasons.push(`moderate import coupling (${file.imports})`);
  }

  if (file.cases > 80) {
    score += 20;
    reasons.push(`large switch/case dispatch (${file.cases} cases)`);
  } else if (file.cases > 35) {
    score += 10;
    reasons.push(`moderate switch/case dispatch (${file.cases} cases)`);
  }

  if (file.ifs > 80) {
    score += 10;
    reasons.push(`high conditional density (${file.ifs} ifs)`);
  }

  if (file.maxBraceDepth > 8) {
    score += 12;
    reasons.push(`deep brace nesting (${file.maxBraceDepth})`);
  }

  const legacyCount = Object.values(file.legacyHits).reduce((sum, count) => sum + count, 0);
  if (legacyCount > 0) {
    score += Math.min(20, legacyCount * 2);
    reasons.push(`legacy directive references (${legacyCount})`);
  }

  if (file.directiveRefs > 150) {
    score += 10;
    reasons.push(`high directive density (${file.directiveRefs} @refs)`);
  }

  return { score, reasons };
}

function recommendationFor(file: FileMetrics): string {
  if (file.file.includes("parser/directives")) {
    return "Continue splitting directive parsing into semantic vertical slices and shared parser helpers.";
  }
  if (file.file.includes("runtime/execute/action")) {
    return "Split action execution into define/apply/pipeline/value-evaluation modules.";
  }
  if (file.file.includes("runtime/query")) {
    return "Split comparison, relationship, where, and path/query evaluators by semantic responsibility.";
  }
  if (file.file.includes("runtime/validation")) {
    return "Split validation into pipeline, mutation, action, project, repeat, query, and value validators.";
  }
  if (file.file.includes("parser/core/Parser")) {
    return "Keep as parser shell only; move semantic parsing behavior into parser/shared and directive slices.";
  }
  if (file.file.includes("runtime/index")) {
    return "Reduce toward public exports only; move orchestration into runtime/engine.";
  }
  if (Object.keys(file.legacyHits).length > 0) {
    return "Review legacy references; keep only migration diagnostics/docs and remove active legacy paths.";
  }
  return "Monitor and refactor if this file grows during the next phase.";
}

function rankHotspots(metrics: FileMetrics[]): RankedHotspot[] {
  return metrics
    .map((file) => {
      const scored = scoreFile(file);
      return {
        rank: 0,
        file: file.file,
        score: scored.score,
        reasons: scored.reasons,
        recommendation: recommendationFor(file),
        metrics: file,
      };
    })
    .filter((hotspot) => hotspot.score > 0)
    .sort((a, b) => b.score - a.score || b.metrics.loc - a.metrics.loc)
    .slice(0, 25)
    .map((hotspot, index) => ({ ...hotspot, rank: index + 1 }));
}

function formatTable(rows: string[][]): string {
  if (!rows.length) return "";
  const widths = rows[0].map((_, col) =>
    Math.max(...rows.map((row) => row[col]?.length ?? 0)),
  );

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

function parseTimingReport(output: string, fixture: string): TimingSnapshot {
  const totalMatch = output.match(/^total:\s+([0-9.]+)ms/m);
  const entries: TimingSnapshot["entries"] = [];
  const entryRegex = /^-\s+([^:]+):\s+([0-9.]+)ms(?:\s+x(\d+))?/gm;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(output))) {
    entries.push({
      name: match[1],
      durationMs: Number(match[2]),
      count: match[3] ? Number(match[3]) : 1,
    });
  }

  return {
    fixture,
    totalMs: totalMatch ? Number(totalMatch[1]) : null,
    entries,
  };
}

function collectTimingSnapshots(root: string, fixtures: string[]): TimingSnapshot[] {
  return fixtures.map((fixture) => {
    try {
      if (!existsSync(join(root, fixture))) {
        return { fixture, totalMs: null, entries: [], error: "Fixture not found" };
      }

      const output = execFileSync(
        "npx",
        ["tsx", "run-module.ts", fixture, "--timing"],
        { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
      return parseTimingReport(output, fixture);
    } catch (error) {
      return {
        fixture,
        totalMs: null,
        entries: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
}

function timingSection(snapshots: TimingSnapshot[]): string[] {
  if (!snapshots.length) {
    return [
      "## Runtime timing hotspots",
      "",
      "Timing snapshots were not requested. Run with `--include-timing` to execute canonical fixtures and include timing data.",
      "",
    ];
  }

  const allEntries = new Map<string, { durationMs: number; count: number }>();
  for (const snapshot of snapshots) {
    for (const entry of snapshot.entries) {
      const existing = allEntries.get(entry.name) ?? { durationMs: 0, count: 0 };
      existing.durationMs += entry.durationMs;
      existing.count += entry.count;
      allEntries.set(entry.name, existing);
    }
  }

  const phaseRows = [...allEntries.entries()]
    .sort((a, b) => b[1].durationMs - a[1].durationMs)
    .map(([name, value]) => [name, `${value.durationMs.toFixed(2)}ms`, String(value.count)]);

  return [
    "## Runtime timing hotspots",
    "",
    "### Fixture totals",
    "",
    "```txt",
    formatTable([
      ["Fixture", "Total", "Status"],
      ...snapshots.map((snapshot) => [
        snapshot.fixture,
        snapshot.totalMs === null ? "-" : `${snapshot.totalMs.toFixed(2)}ms`,
        snapshot.error ? `error: ${snapshot.error.split("\n")[0]}` : "ok",
      ]),
    ]),
    "```",
    "",
    "### Aggregated timing phases",
    "",
    phaseRows.length
      ? "```txt\n" + formatTable([["Phase", "Duration", "Count"], ...phaseRows]) + "\n```"
      : "No timing entries captured.",
    "",
  ];
}

function makeReport(metrics: FileMetrics[], timings: TimingSnapshot[]): string {
  const totalLoc = metrics.reduce((sum, file) => sum + file.loc, 0);
  const hotspots = rankHotspots(metrics);
  const legacyFiles = metrics.filter((file) => Object.keys(file.legacyHits).length > 0);
  const legacyTotals = new Map<string, number>();

  for (const file of legacyFiles) {
    for (const [pattern, count] of Object.entries(file.legacyHits)) {
      legacyTotals.set(pattern, (legacyTotals.get(pattern) ?? 0) + count);
    }
  }

  return [
    "# TAT Phase 8.3 Hotspot Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Purpose",
    "",
    "Phase 8.3 turns Phase 8.1 runtime timing and Phase 8.2 code-health metrics into a ranked refactor plan. This report is evidence-gathering only; it does not change runtime behavior.",
    "",
    "## Snapshot",
    "",
    `- Source files scanned: ${metrics.length}`,
    `- Approximate non-empty LOC: ${totalLoc.toLocaleString()}`,
    `- Ranked hotspots found: ${hotspots.length}`,
    `- Files with legacy-pattern hits: ${legacyFiles.length}`,
    "",
    ...timingSection(timings),
    "## Ranked code hotspots",
    "",
    "```txt",
    formatTable([
      ["Rank", "Score", "File", "LOC", "Fns", "Imports", "Cases", "Depth"],
      ...hotspots.slice(0, 15).map((hotspot) => [
        String(hotspot.rank),
        String(hotspot.score),
        hotspot.file,
        String(hotspot.metrics.loc),
        String(hotspot.metrics.functions),
        String(hotspot.metrics.imports),
        String(hotspot.metrics.cases),
        String(hotspot.metrics.maxBraceDepth),
      ]),
    ]),
    "```",
    "",
    "## Hotspot explanations",
    "",
    ...hotspots.slice(0, 10).flatMap((hotspot) => [
      `### ${hotspot.rank}. ${hotspot.file}`,
      "",
      `Score: **${hotspot.score}**`,
      "",
      "Signals:",
      "",
      ...hotspot.reasons.map((reason) => `- ${reason}`),
      "",
      "Recommended action:",
      "",
      hotspot.recommendation,
      "",
    ]),
    "## Legacy drift hotspots",
    "",
    legacyFiles.length
      ? "```txt\n" +
          formatTable([
            ["File", "Hits"],
            ...legacyFiles.map((file) => [
              file.file,
              Object.entries(file.legacyHits)
                .map(([key, value]) => `${key}:${value}`)
                .join(", "),
            ]),
          ]) +
          "\n```"
      : "No legacy-pattern files found.",
    "",
    "### Legacy pattern totals",
    "",
    legacyTotals.size
      ? "```txt\n" +
          formatTable([
            ["Pattern", "Hits"],
            ...[...legacyTotals.entries()].sort((a, b) => b[1] - a[1]).map(([pattern, hits]) => [pattern, String(hits)]),
          ]) +
          "\n```"
      : "No legacy-pattern hits found.",
    "",
    "## Recommended 8.4 refactor order",
    "",
    "1. Split the highest-scoring parser directive hotspots into smaller semantic parser modules and shared parser helpers.",
    "2. Split the highest-scoring runtime execution hotspot into focused action/apply/pipeline/value files.",
    "3. Split validation hotspots so control, mutation, action, project, value, and query validators are separate.",
    "4. Keep legacy strings only in migration diagnostics/docs; remove active legacy AST/runtime/parser paths.",
    "5. After structural pruning, rerun this report and compare hotspot scores before adding caches.",
    "",
    "## Command",
    "",
    "```bash",
    "npx tsx tools/code-health/hotspots.ts --include-timing --out docs/reports/phase-8-3-hotspots.md",
    "```",
    "",
  ].join("\n");
}

function main(): void {
  const args = process.argv.slice(2);
  const outArgIndex = args.findIndex((arg) => arg === "--out");
  const outPath = outArgIndex >= 0 ? args[outArgIndex + 1] : null;
  const includeTiming = args.includes("--include-timing");
  const rootArg = args.find((arg, index) => {
    if (arg.startsWith("--")) return false;
    if (index === outArgIndex + 1) return false;
    return true;
  });
  const root = rootArg ?? process.cwd();
  const files = walk(root);
  const metrics = files.map((file) => metricsFor(file, readFileSync(join(root, file), "utf8")));
  const timings = includeTiming ? collectTimingSnapshots(root, DEFAULT_TIMING_FIXTURES) : [];
  const report = makeReport(metrics, timings);

  if (outPath) {
    const fullOutPath = join(root, outPath);
    mkdirSync(dirname(fullOutPath), { recursive: true });
    writeFileSync(fullOutPath, report);
    console.log(`Wrote hotspot report to ${fullOutPath}`);
    return;
  }

  console.log(report);
}

main();
