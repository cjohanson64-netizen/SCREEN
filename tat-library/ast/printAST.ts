import type { ProgramNode } from "./nodeTypes.js";
import { printNode } from "./printers/printNode.js";

export function printAST(program: ProgramNode): string {
  const lines: string[] = [];
  printNode(program, 0, lines);
  return lines.join("\n");
}
