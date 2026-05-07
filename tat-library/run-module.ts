import { existsSync } from "node:fs";
import path from "node:path";

import { TokenizeError } from "./lexer/tokenize.js";
import { ParseError } from "./parser/parse.js";
import { executeTatModule } from "./runtime/engine/executeModule.js";
import type { ExecuteProgramResult } from "./runtime/engine/executeProgram.js";
import type { RuntimeTimingReport } from "./runtime/instrumentation/timing.js";
import type { RuntimeProfileReport } from "./runtime/instrumentation/profiler.js";

type PrintableGraph = {
  root?: unknown;
  nodes?: unknown;
  edges?: unknown;
  state?: unknown;
  meta?: unknown;
};

type PrintableEdge = {
  subject?: unknown;
  relation?: unknown;
  object?: unknown;
};

function main() {
  const args = process.argv.slice(2);
  const timingEnabled = args.includes("--timing");
  const profileEnabled = args.includes("--profile");
  const cacheEnabled = args.includes("--cache");
  const inputPath = args.find((arg) => !arg.startsWith("--"));

  if (!inputPath) {
    console.error("Usage: npx tsx run-module.ts <file.tat> [--timing] [--profile] [--cache]");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), inputPath);

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const loaded = executeTatModule(filePath, {
      timing: timingEnabled || profileEnabled,
      profile: profileEnabled,
      parseCache: cacheEnabled,
      injectionFragmentCache: cacheEnabled,
    });
    const result: ExecuteProgramResult = { state: loaded.state };

    console.log("TAT module ran successfully.\n");

    printExecutionSummary(result);

    if (loaded.timing) {
      printTimingReport(loaded.timing);
    }

    if (loaded.profile) {
      printProfileReport(loaded.profile);
    }
  } catch (error) {
    handleError(error);
  }
}

function printProfileReport(report: RuntimeProfileReport): void {
  console.log("Runtime profile:\n");

  if (report.entries.length === 0) {
    console.log("No profiled operations recorded.\n");
    return;
  }

  console.log("Operation                     Count   Total      Avg        Max");
  console.log("---------------------------- ------- ---------- ---------- ----------");

  for (const entry of report.entries) {
    const avg = entry.count === 0 ? 0 : entry.totalMs / entry.count;
    console.log(
      `${entry.operation.padEnd(28)} ${String(entry.count).padStart(7)} ${formatDuration(entry.totalMs).padStart(10)} ${formatDuration(avg).padStart(10)} ${formatDuration(entry.maxMs).padStart(10)}`,
    );
  }

  console.log("");
}

function printTimingReport(report: RuntimeTimingReport): void {
  console.log("Timing report:\n");
  console.log(`total: ${formatDuration(report.totalMs)}`);

  for (const entry of report.entries) {
    const count = entry.count > 1 ? ` x${entry.count}` : "";
    console.log(`- ${entry.name}: ${formatDuration(entry.durationMs)}${count}`);
  }

  console.log("");
}

function formatDuration(durationMs: number): string {
  return `${durationMs.toFixed(2)}ms`;
}

function printExecutionSummary(result: ExecuteProgramResult): void {
  const { state } = result;

  if (state.injectionHistory.length > 0) {
    console.log("Injections executed:\n");

    for (const injection of state.injectionHistory) {
      console.log(
        `- ${injection.context} ${injection.hookRef} ${injection.fileExtension}: ${injection.status}`,
      );

      if (typeof injection.executedStepCount === "number") {
        console.log(`  executedStepCount: ${injection.executedStepCount}`);
      }

      if (injection.error) {
        console.log(`  error: ${injection.error}`);
      }

      console.log("");
    }
  }

  if (state.interactionHistory.length > 0) {
    console.log("Graph interactions executed:\n");

    for (const interaction of state.interactionHistory) {
      const bridge =
        interaction.bridge.type === "explicit"
          ? `: @ctx(${interaction.bridge.ctx}) ::`
          : ":::";

      console.log(
        `- ${interaction.sourceGraphId} ${bridge} ${interaction.targetGraphId}`,
      );
      console.log(`  through: ${interaction.through}`);
      console.log(`  target: ${interaction.targetNodeId}`);

      if (interaction.summary?.effects?.length) {
        console.log("  effects:");

        for (const effect of interaction.summary.effects) {
          console.log(
            `    - ${effect.op}${effect.key ? ` ${effect.key}` : ""}`,
          );
        }
      }

      console.log("");
    }
  }

  printGraphs(state.graphs);
}

function printGraphs(graphs: Map<string, unknown>): void {
  if (graphs.size === 0) {
    console.log("No graphs found.\n");
    return;
  }

  console.log("Graphs:\n");

  for (const [graphName, rawGraph] of graphs.entries()) {
    const graph = rawGraph as PrintableGraph;

    console.log(`## ${graphName}`);

    printGraphRoot(graph);
    printGraphNodes(graph);
    printGraphEdges(graph);
    printGraphState(graph);
    printGraphMeta(graph);

    console.log("");
  }
}

function printGraphRoot(graph: PrintableGraph): void {
  if (typeof graph.root === "undefined" || graph.root === null) {
    return;
  }

  console.log(`Root: ${formatValue(graph.root)}`);
}

function printGraphNodes(graph: PrintableGraph): void {
  const nodes = normalizeCollection(graph.nodes);

  console.log("Nodes:");

  if (nodes.length === 0) {
    console.log("  - none");
    return;
  }

  for (const node of nodes) {
    console.log(`  - ${formatNode(node)}`);
  }
}

function printGraphEdges(graph: PrintableGraph): void {
  const edges = normalizeCollection(graph.edges) as PrintableEdge[];

  console.log("Edges:");

  if (edges.length === 0) {
    console.log("  - none");
    return;
  }

  for (const edge of edges) {
    console.log(
      `  - [${formatValue(edge.subject)} : ${formatValue(edge.relation)} : ${formatValue(edge.object)}]`,
    );
  }
}

function printGraphState(graph: PrintableGraph): void {
  if (isEmptyRecordLike(graph.state)) {
    return;
  }

  console.log("State:");
  printIndentedJson(graph.state, "  ");
}

function printGraphMeta(graph: PrintableGraph): void {
  if (isEmptyRecordLike(graph.meta)) {
    return;
  }

  console.log("Meta:");
  printIndentedJson(graph.meta, "  ");
}

function normalizeCollection(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value instanceof Map) {
    return Array.from(value.values());
  }

  if (value instanceof Set) {
    return Array.from(value.values());
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>);
  }

  return [];
}

function formatNode(node: unknown): string {
  if (typeof node === "string") {
    return node;
  }

  if (node && typeof node === "object") {
    const record = node as Record<string, unknown>;
    const id = record.id ?? record.name ?? record.label;

    if (id) {
      const label = record.label ?? record.name;

      if (label && label !== id) {
        return `${formatValue(id)} (${formatValue(label)})`;
      }

      return formatValue(id);
    }
  }

  return formatValue(node);
}

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return String(value);
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  return JSON.stringify(value);
}

function printIndentedJson(value: unknown, indent: string): void {
  const printable = normalizePrintable(value);
  const json = JSON.stringify(printable, null, 2);

  if (!json) {
    console.log(`${indent}${String(value)}`);
    return;
  }

  for (const line of json.split("\n")) {
    console.log(`${indent}${line}`);
  }
}

function normalizePrintable(value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  if (value instanceof Set) {
    return Array.from(value.values());
  }

  if (Array.isArray(value)) {
    return value.map(normalizePrintable);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(record)) {
      normalized[key] = normalizePrintable(nestedValue);
    }

    return normalized;
  }

  return value;
}

function isEmptyRecordLike(value: unknown): boolean {
  if (value === null || typeof value === "undefined") {
    return true;
  }

  if (value instanceof Map) {
    return value.size === 0;
  }

  if (value instanceof Set) {
    return value.size === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }

  return false;
}

function handleError(error: unknown): never {
  if (error instanceof TokenizeError) {
    console.error(`Tokenize error at ${error.line}:${error.column}`);
    console.error(error.message);
    process.exit(1);
  }

  if (error instanceof ParseError) {
    console.error(`Parse error at ${error.token.line}:${error.token.column}`);
    console.error(error.message);
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }

  console.error("Unknown TAT runtime error");
  process.exit(1);

  throw new Error("Unreachable");
}

main();