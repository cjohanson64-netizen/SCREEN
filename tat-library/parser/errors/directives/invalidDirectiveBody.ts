export function invalidDirectiveBodyMessage(directive: string, expected: string): string {
  return `Invalid body for ${directive}. Expected ${expected}`;
}
