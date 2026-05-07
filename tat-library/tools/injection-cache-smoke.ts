import path from "node:path";

import { executeTatModule } from "../runtime/engine/executeModule.js";
import { RuntimeInjectionFragmentCache } from "../runtime/cache/injectionFragmentCache.js";

const inputPath = process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? "tests/injection/inject-graph-flow.tat";
const filePath = path.resolve(process.cwd(), inputPath);
const injectionFragmentCache = new RuntimeInjectionFragmentCache();

const injections = {
  python_steps: {
    fileExtension: ".py",
    source: `
-> @graft.state(root, injected, true)
-> @graft.meta(root, injectedLabel, "Injected")
`,
  },
  python_nodes: {
    fileExtension: ".py",
    source: `
injectedNode = <{ name: "Injected" }>
`,
  },
};

const first = executeTatModule(filePath, {
  timing: true,
  injectionFragmentCache,
  injections,
});

const second = executeTatModule(filePath, {
  timing: true,
  injectionFragmentCache,
  injections,
});

console.log("Injection fragment cache smoke test complete.\n");
console.log(`File: ${inputPath}`);
console.log(`Cache entries: ${injectionFragmentCache.stats().entries}`);
console.log(`Cache misses: ${injectionFragmentCache.stats().misses}`);
console.log(`Cache hits: ${injectionFragmentCache.stats().hits}\n`);
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
