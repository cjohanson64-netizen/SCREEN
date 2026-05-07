export const TASK_INSTRUCTIONS = {
  refactor: {
    title: "Refactor this file",
    intro:
      "You are refactoring this file into a clearer architecture without changing behavior.",
  },
  analyze: {
    title: "Analyze this system",
    intro:
      "You are analyzing this code to identify architecture, responsibilities, risks, and improvement opportunities.",
  },
  explain: {
    title: "Explain this architecture",
    intro:
      "You are explaining how this code is structured and how its major responsibilities interact.",
  },
  optimize: {
    title: "Optimize this code",
    intro:
      "You are reviewing this code for targeted performance and maintainability improvements without changing behavior.",
  },
  test: {
    title: "Generate tests",
    intro:
      "You are generating practical tests that protect the riskiest behavior in this code.",
  },
  extract: {
    title: "Extract reusable modules",
    intro:
      "You are extracting reusable modules from this code while preserving external behavior.",
  },
  review: {
    title: "Review this code",
    intro:
      "You are performing a senior-level code review focused on risk, maintainability, and next actions.",
  },
};

export const ARCHITECTURE_TARGETS = {
  pipeline: {
    title: "Pipeline Architecture",
    instruction:
      "The final design must expose a clear top-level orchestration flow. The main entry point should read as a linear sequence of named phases.",
  },
  service_layer: {
    title: "Service-Layer Architecture",
    instruction:
      "The final design should separate orchestration from domain logic by moving responsibilities into focused service or helper modules.",
  },
  state_machine: {
    title: "Reducer / State-Machine Architecture",
    instruction:
      "The final design should make states, transitions, and decision paths explicit through named reducers, predicates, or state-transition helpers.",
  },
  component_composition: {
    title: "Component Composition Architecture",
    instruction:
      "The final design should separate UI responsibilities into focused components or style sections with clear ownership.",
  },
  adapter_orchestrator: {
    title: "Adapter / Orchestrator Architecture",
    instruction:
      "The final design should use a clear orchestrator that coordinates smaller adapters, handlers, or processing units.",
  },
  tat_semantic_model: {
    title: "TAT Semantic Model",
    instruction:
      "The final design should move behavioral meaning into explicit graph relationships, semantic nodes, and projection-friendly structure.",
  },
};

export const STRICTNESS_CONTRACTS = {
  behavior_preserving: [
    "Do not change algorithmic behavior.",
    "Do not remove edge cases.",
    "Do not change thresholds, scoring rules, constants, or fallback behavior.",
    "Do not change public exports, return shapes, or data shapes unless absolutely necessary.",
  ],
  moderate: [
    "Preserve core behavior and public APIs.",
    "Small internal improvements are allowed if they reduce complexity.",
    "Call out any behavior changes explicitly.",
  ],
  exploratory: [
    "You may suggest deeper restructuring if it improves clarity or maintainability.",
    "Clearly separate safe changes from speculative improvements.",
    "Do not hide behavior changes.",
  ],
};

export const REASONING_PASSES = {
  refactor: [
    "Identify the current responsibilities.",
    "Identify the hidden architecture or processing flow.",
    "Identify repeated logic or repeated decision patterns.",
    "Identify risky behavior that must be preserved.",
  ],
  analyze: [
    "Identify the main responsibilities.",
    "Identify risk areas.",
    "Identify coupling, repetition, and complexity.",
    "Explain what should be improved first.",
  ],
  explain: [
    "Identify the main parts of the code.",
    "Explain how data moves through the code.",
    "Explain the most important decision points.",
    "Explain what makes the code easy or hard to change.",
  ],
  optimize: [
    "Identify repeated work or unnecessary recomputation.",
    "Identify expensive loops or transformations.",
    "Identify performance improvements that preserve behavior.",
    "Separate performance concerns from readability concerns.",
  ],
  test: [
    "Identify the riskiest behavior.",
    "Identify edge cases and fallback behavior.",
    "Identify test seams.",
    "Prioritize tests that protect behavior before refactoring.",
  ],
  extract: [
    "Identify extractable responsibilities.",
    "Identify shared helpers or modules.",
    "Identify public API boundaries.",
    "Identify what must remain unchanged.",
  ],
  review: [
    "Identify the highest-risk findings.",
    "Explain why they matter.",
    "Suggest the safest next action.",
    "Separate urgent fixes from optional cleanup.",
  ],
};

export const OUTPUT_CONTRACTS = {
  full_files: [
    "Brief architecture diagnosis.",
    "New file/module structure.",
    "Full updated main file.",
    "Full code for extracted helpers/modules.",
    "Behavior-preservation notes.",
    "List of intentionally unchanged logic.",
  ],
  diff: [
    "Brief diagnosis.",
    "Change list grouped by file.",
    "Before/after snippets for each meaningful change.",
    "Behavior-preservation notes.",
  ],
  plan: [
    "Brief diagnosis.",
    "Step-by-step implementation plan.",
    "Recommended extraction order.",
    "Risks to watch during refactor.",
  ],
  explanation: [
    "Architecture explanation.",
    "Responsibility breakdown.",
    "Risk explanation.",
    "Suggested next steps without rewriting code.",
  ],
};