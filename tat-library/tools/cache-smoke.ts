import path from "node:path";

import { executeTatModule } from "../runtime/engine/executeModule.js";
import { RuntimeParseCache } from "../runtime/cache/parseCache.js";

const inputPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "tests/all-directives-expanded.tat";
const filePath = path.resolve(process.cwd(), inputPath);
const parseCache = new RuntimeParseCache();

const first = executeTatModule(filePath, {
  timing: true,
  parseCache,
});

const second = executeTatModule(filePath, {
  timing: true,
  parseCache,
});

console.log("Parse cache smoke test complete.\n");
console.log(`File: ${inputPath}`);
console.log(`Cache entries: ${parseCache.stats().entries}`);
console.log(`Cache misses: ${parseCache.stats().misses}`);
console.log(`Cache hits: ${parseCache.stats().hits}\n`);
console.log("First run timing:");
printTiming(first.timing);
console.log("Second run timing:");
printTiming(second.timing);

function printTiming(report: { entries: Array<{ name: string; count: number; durationMs: number }> } | undefined): void {
  if (!report) {
    console.log("  no timing report\n");
    return;
  }

  for (const entry of report.entries) {
    const count = entry.count > 1 ? ` x${entry.count}` : "";
    console.log(`  - ${entry.name}: ${entry.durationMs.toFixed(2)}ms${count}`);
  }

  console.log("");
}
