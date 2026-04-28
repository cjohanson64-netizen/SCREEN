import { formatReviewLabel } from "./formatters";

const MINI_PROMPT_TEMPLATES = {
  deep_nesting: `
You are a senior software engineer.

This code suffers from deep nesting.

Task:
- Refactor the code to reduce nesting
- Use guard clauses, early returns, or helper functions

Constraints:
- Do not change behavior
- Preserve all logic and edge cases

Output:
- Refactored code
- Explanation of changes
`,

  high_complexity: `
You are a senior software engineer.

This code has high complexity due to heavy branching and decision logic.

Task:
- Simplify the decision structure
- Extract complex logic into named helper functions

Constraints:
- Do not change behavior
- Preserve all conditions and thresholds

Output:
- Refactored code
- Explanation of simplifications
`,

  long_file: `
You are a senior software engineer.

This file is too large and likely contains multiple responsibilities.

Task:
- Break this file into smaller modules
- Separate concerns (UI, logic, utilities)

Constraints:
- Do not change behavior
- Preserve public interfaces

Output:
- Proposed file structure
- Extracted modules
`,

  repeated_patterns: `
You are a senior software engineer.

This code contains repeated patterns.

Task:
- Identify repeated logic
- Extract shared utilities or pipelines

Constraints:
- Do not change behavior
- Do not over-abstract trivial repetition

Output:
- Refactored code
- Extracted helpers
`,

  many_decisions: `
You are a senior software engineer.

This code has many decision points.

Task:
- Simplify decision logic
- Use named predicates or strategy patterns

Constraints:
- Preserve behavior

Output:
- Refactored decision structure
- Explanation
`,
};

export function buildMiniPrompt(signal, { code }) {
  const template = MINI_PROMPT_TEMPLATES[signal];

  if (!template) {
    return `
You are a senior software engineer.

Task:
- Analyze and improve the following code related to: ${formatReviewLabel(signal)}

Constraints:
- Preserve behavior

Code:
${code}
`;
  }

  return `${template}

Code:
${code}
`;
}