import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { tokenize, TokenizeError } from "./lexer/tokenize.js";
import { parse, ParseError } from "./parser/parse.js";
import { validateProgram } from "./runtime/validateProgram.js";
import { executeProgram } from "./runtime/executeProgram.js";

function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error("Usage: npx tsx run-module.ts <file.tat>");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), inputPath);

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const source = readFileSync(filePath, "utf8");

    const tokens = tokenize(source);
    const program = parse(tokens);

    const issues = validateProgram(program);

    if (issues.length > 0) {
      console.log("TAT validation issues:");

      for (const issue of issues) {
        const line = issue.span?.line ?? "?";
        const column = issue.span?.column ?? "?";

        console.log(`- [${issue.severity}] ${line}:${column} ${issue.message}`);
      }

      const hasError = issues.some((issue) => issue.severity === "error");

      if (hasError) {
        process.exit(1);
      }
    }

    const result = executeProgram(program);

    console.log("TAT module ran successfully.\n");

    const graph = result.state.graphs.get("graph");

    if (!graph) {
      console.log("No graph found.");
      process.exit(0);
    }

    const edges = graph.edges ?? [];

    console.log("Edges:\n");

    if (edges.length === 0) {
      console.log("No edges created.\n");
      process.exit(0);
    }

    for (const edge of edges) {
      console.log(`${edge.subject} --${edge.relation}--> ${edge.object}`);
    }
  } catch (error) {
    handleError(error);
  }
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
