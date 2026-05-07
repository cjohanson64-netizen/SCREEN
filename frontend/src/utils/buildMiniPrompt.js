import { formatReviewLabel } from "./formatters";

const MINI_PROMPT_TEMPLATES = {
  deeply_nested: `
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

  complexity_high: `
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
- Separate concerns such as UI, logic, utilities, hooks, and services

Constraints:
- Do not change behavior
- Preserve public interfaces

Output:
- Proposed file structure
- Extracted modules
- Updated imports
`,

  repetition_high: `
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

  decision_heavy: `
You are a senior software engineer.

This code has many decision points.

Task:
- Simplify decision logic
- Use named predicates, lookup maps, or strategy functions

Constraints:
- Preserve behavior

Output:
- Refactored decision structure
- Explanation
`,

  hook_heavy: `
You are a senior React engineer.

This file contains several hook-shaped useX functions.

Task:
- Identify related useX functions
- Recommend a hooks folder or focused custom-hook modules
- Extract hooks only when the grouping improves clarity

Constraints:
- Do not change behavior
- Preserve hook call rules
- Preserve imports and exports

Output:
- Proposed hooks file structure
- Updated source files
- Explanation of why each hook moved
`,

  component_heavy: `
You are a senior React engineer.

This file contains several PascalCase component-shaped functions.

Task:
- Identify child components that should be extracted
- Keep the main component readable
- Preserve props, rendering behavior, and CSS class names

Constraints:
- Do not change behavior
- Preserve component APIs
- Preserve imports and exports

Output:
- Proposed component file structure
- Updated source files
- Explanation of component boundaries
`,

  analyzer_heavy: `
You are a senior software engineer.

This file contains several analyzeX or detectX functions.

Task:
- Group related analysis functions into a focused analyzer module
- Keep one clear orchestration function at the top level
- Make the analysis pipeline easier to scan

Constraints:
- Do not change behavior
- Preserve input/output shapes
- Preserve all thresholds and rules

Output:
- Proposed analyzer module structure
- Updated code
- Explanation of analysis responsibilities
`,

  predicate_heavy: `
You are a senior software engineer.

This file contains several predicate-shaped functions such as hasX, isX, canX, or shouldX.

Task:
- Extract related rule checks into named predicate or guard helpers
- Make the business rules easier to find and test

Constraints:
- Do not change behavior
- Preserve all condition logic

Output:
- Refactored predicate structure
- Updated code
- Explanation of rule boundaries
`,

  handler_heavy: `
You are a senior frontend engineer.

This file contains several handler-shaped functions such as handleX or toggleX.

Task:
- Group related interaction handlers
- Separate event behavior from rendering where it improves clarity
- Keep state updates easy to trace

Constraints:
- Do not change behavior
- Preserve event behavior
- Preserve component APIs

Output:
- Refactored handler structure
- Updated code
- Explanation of interaction boundaries
`,
  boolean_constant_heavy: `
You are a senior software engineer.

This file contains many boolean-shaped constants such as isX, hasX, canX, and shouldX.

Task:
- Identify related boolean constants
- Group them into predicate helpers, guard helpers, or a focused rule module
- Make the rule logic easier to read and test

Constraints:
- Do not change behavior
- Preserve all boolean conditions
- Preserve all public exports and return shapes

Output:
- Proposed rule/predicate structure
- Updated code
- Explanation of boolean rule groupings
`,

  threshold_constant_heavy: `
You are a senior software engineer.

This file contains several threshold or configuration constants.

Task:
- Identify related MAX, MIN, DEFAULT, LIMIT, THRESHOLD, timing, score, ratio, and confidence constants
- Group related constants into a constants, config, or scoring-rules module
- Make tuning values easier to audit

Constraints:
- Do not change any constant values
- Do not change behavior
- Preserve all imports and exports

Output:
- Proposed constants/config structure
- Updated code
- Explanation of unchanged values
`,

  flag_constant_heavy: `
You are a senior frontend engineer.

This file contains several flag-shaped constants.

Task:
- Identify related UI/state flags
- Group flags by state domain or UI region
- Make local state decisions easier to follow

Constraints:
- Do not change behavior
- Preserve all flag meanings and default values

Output:
- Proposed state/flag grouping
- Updated code
- Explanation of grouped flags
`,

  decision_rule_constant_heavy: `
You are a senior software engineer.

This file contains several decision-rule constants.

Task:
- Identify constants that represent policy, permission, requirement, or decision logic
- Group them into named rule helpers or predicate modules

Constraints:
- Do not change behavior
- Preserve all rule conditions and fallback behavior

Output:
- Proposed decision-rule structure
- Updated code
- Explanation of rule boundaries
`,

  visibility_flag_heavy: `
You are a senior frontend engineer.

This file contains several visibility-related constants such as showX, hideX, or visibleX.

Task:
- Group visibility rules by UI region
- Make display conditions easier to scan and test

Constraints:
- Do not change rendering behavior
- Preserve all visibility defaults

Output:
- Proposed visibility-rule structure
- Updated code
- Explanation of unchanged rendering behavior
`,
  render_data_projection: `
You are a senior frontend engineer.

This file projects several values into render-ready constants.

Task:
- Identify constants that prepare data for rendering
- Decide whether they should stay local or move into a selector, custom hook, or view-model helper
- Preserve all rendered values and fallback behavior

Constraints:
- Do not change behavior
- Do not change fallback values
- Do not invent import paths

Output:
- Render-data projection diagnosis
- Proposed grouping
- Updated code only if extraction is safe
`,

  action_guard_heavy: `
You are a senior frontend engineer.

This file contains several action-guard constants.

Task:
- Identify constants that control disabled, enabled, allowed, or blocked actions
- Group related guards into predicate helpers or interaction-rule helpers
- Make action permissions easier to read and test

Constraints:
- Do not change behavior
- Preserve all guard conditions
- Preserve all button/input behavior

Output:
- Action guard diagnosis
- Proposed guard helper structure
- Updated code only if safe
`,

  view_model_pressure: `
You are a senior frontend engineer.

This file appears to build a view model inline through aliases, derived values, and action guards.

Task:
- Identify render-data aliases, derived values, and action guards
- Extract view-model preparation only if it improves clarity
- Keep the component render flow readable

Constraints:
- Do not change behavior
- Preserve all props, rendered values, and fallback values
- Do not invent import paths

Output:
- View-model pressure diagnosis
- Proposed selector/custom-hook/view-model helper
- Updated code only if extraction is safe
`,

  function_expression_constant_heavy: `
You are a senior software engineer.

This file declares several functions through const-style assignments.

Task:
- Treat const arrow functions as functions, not ordinary constants
- Group related function expressions by responsibility
- Recommend extraction only when it improves clarity

Constraints:
- Do not change behavior
- Preserve function names, exports, and call signatures

Output:
- Function-expression diagnosis
- Suggested grouping
- Updated code only if safe
`,
  import_responsibility_spread: `
You are a senior software engineer.

This file imports from several responsibility zones.

Task:
- Identify the imported responsibility categories
- Decide whether this file is a healthy composition point or is mixing too many layers
- Recommend the safest boundary cleanup

Constraints:
- Do not change behavior
- Do not invent import paths
- Preserve public exports and return shapes

Output:
- Import responsibility diagnosis
- Boundary cleanup recommendation
- Updated code only if extraction is safe
`,

  ui_imports_data_access: `
You are a senior frontend engineer.

This UI-shaped file imports data-access code.

Task:
- Identify direct API/service/repository/database imports
- Recommend whether data access should move into a hook, service wrapper, or parent orchestration layer
- Preserve rendering behavior

Constraints:
- Do not change behavior
- Do not invent import paths
- Preserve all props, state, and rendered output

Output:
- UI/data coupling diagnosis
- Proposed boundary
- Updated code only if safe
`,

  production_imports_test_support: `
You are a senior software engineer.

This production file imports test support code such as fixtures, mocks, stubs, or fakes.

Task:
- Identify test-support imports
- Recommend how to remove production dependency on test-only code
- Preserve runtime behavior

Constraints:
- Do not change behavior
- Do not invent import paths
- Preserve all public exports

Output:
- Production/test dependency diagnosis
- Safer dependency recommendation
- Updated code only if safe
`,

  export_responsibility_spread: `
You are a senior software engineer.

This file exports several different responsibility types.

Task:
- Group exports by semantic role
- Identify whether the module is an intentional public API surface or a grab-bag file
- Recommend safe module boundaries

Constraints:
- Preserve all public exports unless explicitly instructed otherwise
- Do not change behavior
- Do not invent import paths

Output:
- Export surface diagnosis
- Proposed grouping
- Updated code only if safe
`,

  utility_grab_bag: `
You are a senior software engineer.

This file appears to expose a grab bag of utility exports.

Task:
- Group exports by role such as getters, predicates, builders, analyzers, and handlers
- Recommend focused module boundaries
- Preserve public API behavior

Constraints:
- Do not change behavior
- Do not remove exports
- Do not invent import paths

Output:
- Utility grab-bag diagnosis
- Proposed extraction groups
- Updated code only if safe
`,

  public_api_pressure: `
You are a senior software engineer.

This file exposes a large public API surface.

Task:
- Identify the public export surface
- Group exported symbols by responsibility
- Recommend safe refactor boundaries without breaking consumers

Constraints:
- Preserve public exports unless explicitly instructed otherwise
- Do not change behavior
- Do not invent import paths

Output:
- Public API pressure diagnosis
- Export grouping plan
- Updated code only if safe
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