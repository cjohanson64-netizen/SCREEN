export function invalidDirectiveArgumentsMessage(directive: string, expected: string): string {
  return `Invalid arguments for ${directive}. Expected ${expected}`;
}
