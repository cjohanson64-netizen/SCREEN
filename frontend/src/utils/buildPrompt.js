import { formatReviewLabel, formatStructuralRepetition } from "./formatters";
import {
  ARCHITECTURE_TARGETS,
  OUTPUT_CONTRACTS,
  REASONING_PASSES,
  STRICTNESS_CONTRACTS,
  TASK_INSTRUCTIONS,
} from "../constants/promptContracts";
import { DEFAULT_PROMPT_CONFIG } from "../constants/promptOptions";
import { buildArchitectureContext } from "./buildArchitectureContext";

const STRATEGY_BY_SIGNAL = {
  long_file:
    "Split the file by responsibility into smaller modules, components, or services.",
  token_heavy:
    "Reduce code density by extracting helpers and removing unnecessary inline logic.",
  function_heavy:
    "Group related functions and separate responsibilities into dedicated modules.",

  hook_heavy:
    "Move related useX functions into a hooks folder or focused custom-hook modules.",
  component_heavy:
    "Extract PascalCase child components into dedicated component files or a local components folder.",
  getter_heavy:
    "Group getX functions into selectors, data access helpers, or query utilities.",
  setter_heavy:
    "Group setX functions around the state or mutation domain they update.",
  predicate_heavy:
    "Move hasX/isX/canX/shouldX rules into named predicate modules.",
  analyzer_heavy:
    "Split analyzeX/detectX logic into dedicated analyzer modules or rule files.",
  handler_heavy:
    "Group handleX/toggleX UI behavior by event domain or extract focused interaction helpers.",
  builder_heavy:
    "Move buildX/createX/makeX functions into focused builder or factory helpers when they share a construction domain.",
  transformer_heavy:
    "Group parseX/formatX/normalizeX/transformX functions into transformation utilities.",
  io_heavy:
    "Move fetchX/loadX/saveX/sendX functions into service or data-access modules.",
  orchestrator_heavy:
    "Make runX/executeX/applyX orchestration read as a clear named pipeline.",

  block_heavy:
    "Review block-heavy areas for extractable responsibilities or excessive local structure.",
  deeply_nested:
    "Reduce nested logic with early returns, guard clauses, helper functions, or smaller components.",
  long_lines:
    "Shorten dense lines by extracting named expressions, helpers, or configuration objects.",
  repetition_high:
    "Consolidate repeated behavior into shared utilities, not low-level syntax repetition.",
  complexity_high:
    "Simplify decision-heavy logic and reduce branching where possible.",
  decision_heavy:
    "Consolidate decision logic into named predicates, lookup maps, or strategy functions.",
  loop_heavy:
    "Review loops for repeated traversal and consider clearer pipelines, helper functions, or combined passes.",
  boolean_heavy:
    "Extract complex boolean expressions into clearly named variables or predicate helper functions.",
  error_handling_heavy:
    "Centralize repeated error-handling paths and make failure behavior explicit.",
  constant_heavy:
    "Group constants by responsibility so configuration, flags, and rules are easier to locate.",
  boolean_constant_heavy:
    "Group isX/hasX/canX/shouldX constants into predicate helpers, guard helpers, or a focused rule module.",
  threshold_constant_heavy:
    "Move MAX/MIN/DEFAULT/LIMIT/THRESHOLD constants into a constants, config, or scoring-rules module.",
  flag_constant_heavy:
    "Group UI and state flags by state domain or screen region.",
  decision_rule_constant_heavy:
    "Move decision-rule constants into named rule helpers or predicate modules.",
  predicate_constant_heavy:
    "Extract predicate-style constants into named boolean helpers where it improves clarity.",
  capability_constant_heavy:
    "Group canX/allowsX capability constants into permission or capability rule helpers.",
  requirement_rule_constant_heavy:
    "Group needsX/requiresX constants into requirement-rule helpers.",
  feature_flag_constant_heavy:
    "Group enableX/disableX constants into feature-flag configuration.",
  visibility_flag_heavy:
    "Group showX/hideX/visibleX constants into visibility-rule helpers.",
  state_flag_heavy:
    "Group selectedX/openX/loadingX/errorX constants by UI state domain.",
  validation_flag_heavy:
    "Group validX/invalidX constants into validation rule helpers.",
    render_data_projection:
    "Review render-derived constants and consider extracting a selector, view-model helper, or custom hook if the projection is growing.",
  entity_alias_heavy:
    "Group related entity aliases or move render-data preparation into a selector/helper when it improves clarity.",
  collection_alias_heavy:
    "Group collection aliases and collection preparation into a focused helper when the component starts building too much display data.",
  derived_value_heavy:
    "Group derived values by responsibility and consider a view-model helper for render preparation.",
  boolean_expression_constant_heavy:
    "Group boolean expression constants into predicate helpers or guard helpers when they encode reusable rules.",
  action_guard_heavy:
    "Extract action guard constants into named predicate helpers or interaction-rule helpers.",
  function_expression_constant_heavy:
    "Review const function expressions as functions, not ordinary constants, and group them with function responsibilities.",
  view_model_pressure:
    "Extract inline view-model construction into a selector, custom hook, or focused view-model helper.",
    import_heavy:
    "Review whether this file is a healthy composition point or whether imports reveal too many responsibilities.",
  external_import_heavy:
    "Review external package dependencies and keep integration logic isolated where possible.",
  local_import_heavy:
    "Review local project dependencies and reduce coupling only where responsibility boundaries are unclear.",
  deep_relative_import_heavy:
    "Replace deep relative imports with clearer nearby modules or project aliases when appropriate.",
  wide_named_import_heavy:
    "Review wide named imports and split or narrow dependency surfaces where it improves clarity.",
  import_responsibility_spread:
    "Group responsibilities so this file does not coordinate too many layers at once.",
  ui_imports_data_access:
    "Move data-access work out of UI rendering code into hooks, services, or parent orchestration when appropriate.",
  ui_imports_domain_logic:
    "Review whether domain rules belong directly in the UI or should be grouped into selectors/predicates.",
  production_imports_test_support:
    "Remove production dependencies on fixtures, mocks, stubs, or test helpers.",

  export_heavy:
    "Review whether the file is an intentional public API surface or a module that should be split.",
  named_export_heavy:
    "Group named exports by responsibility and split unrelated public symbols when appropriate.",
  default_export_present:
    "Keep the default export stable unless there is a clear reason to change the module API.",
  reexport_heavy:
    "Review re-exports as a public API gateway and keep the exposed surface intentional.",
  star_reexport_present:
    "Review star re-exports carefully because they can expose broad public API surface.",
  barrel_file:
    "Treat this as a barrel/public API module and verify that it groups related exports only.",
  public_api_pressure:
    "Group public exports by responsibility before changing behavior or module boundaries.",
  export_responsibility_spread:
    "Split or group exports by role so the public API surface is easier to understand.",
  mixed_export_roles:
    "Review mixed export roles and identify whether this file has become a grab-bag module.",
  utility_grab_bag:
    "Split utility exports by role, such as getters, predicates, builders, analyzers, or handlers.",
  type_export_heavy:
    "Keep type exports stable and consider grouping related contracts if the type surface is growing.",
};

const STRATEGY_BY_RISK = {
  risky_to_extend:
    "Treat this as a refactor candidate before adding new features; prioritize behavior-preserving changes.",
};

export function buildPrompt({
  filename = "",
  code,
  signals = [],
  risks = [],
  findings = [],
  repetition,
  config = DEFAULT_PROMPT_CONFIG,
  selectedProjectFile,
}) {
  const promptConfig = {
    ...DEFAULT_PROMPT_CONFIG,
    ...config,
  };

  const task = TASK_INSTRUCTIONS[promptConfig.task];
  const architecture = ARCHITECTURE_TARGETS[promptConfig.targetArchitecture];
  const strictness =
    STRICTNESS_CONTRACTS[promptConfig.strictness] ??
    STRICTNESS_CONTRACTS.behavior_preserving;
  const reasoningPasses =
    REASONING_PASSES[promptConfig.task] ?? REASONING_PASSES.refactor;
  const outputContract =
    OUTPUT_CONTRACTS[promptConfig.outputFormat] ?? OUTPUT_CONTRACTS.full_files;

  const architectureContext = buildArchitectureContext(selectedProjectFile);

  const causes = signals
    .filter((signal) => signal !== "repeated_patterns")
    .map(formatReviewLabel);

  const structuralRepetitions =
    repetition?.structuralRepetitions?.slice(0, 5) ?? [];

  const highPriority = [
    ...risks.map((risk) => STRATEGY_BY_RISK[risk]).filter(Boolean),
    ...signals.map((signal) => STRATEGY_BY_SIGNAL[signal]).filter(Boolean),
  ];

  const dedupedHighPriority = [...new Set(highPriority)];

  if (dedupedHighPriority.length === 0) {
    dedupedHighPriority.push(
      "Improve readability and maintainability with small, targeted changes.",
    );
  }

  const lines = [];

  if (architectureContext) {
    lines.push(architectureContext, "", "---", "");
  }

  lines.push(
    task?.intro ?? TASK_INSTRUCTIONS.refactor.intro,
    "",
    "Goal:",
    getGoalLine(promptConfig),
    "",
    "---",
    "",
    "Prompt Configuration:",
    `- Task: ${formatReviewLabel(promptConfig.task)}`,
    `- Target Architecture: ${
      architecture?.title ?? promptConfig.targetArchitecture
    }`,
    `- Strictness: ${formatReviewLabel(promptConfig.strictness)}`,
    `- Output Format: ${formatReviewLabel(promptConfig.outputFormat)}`,
    `- Risk Level: ${formatReviewLabel(promptConfig.riskLevel)}`,
    `- Domain: ${formatReviewLabel(promptConfig.domain)}`,
    "",
    "---",
    "",
    "Architecture Target:",
    architecture?.instruction ??
      "The final design should make the current structure clearer and easier to maintain.",
    "",
    "---",
    "",
    "Primary issues detected:",
    ...formatListOrFallback(causes, "No major issues detected."),
  );

  if (risks.includes("risky_to_extend")) {
    lines.push(
      "",
      "This file is considered high risk and should be refactored before adding new behavior.",
    );
  }

  if (findings.length > 0) {
    lines.push(
      "",
      "Actionable findings:",
      ...findings.map(
        (finding) =>
          `- ${finding.rule}: ${finding.message} Next action: ${finding.nextAction}`,
      ),
    );
  }

  if (structuralRepetitions.length > 0) {
    lines.push(
      "",
      "Repeated structural patterns detected:",
      ...structuralRepetitions.map(
        (item) =>
          `- ${formatStructuralRepetition(item.type)} (${item.count} related occurrences)`,
      ),
      "",
      "Focus on consolidating repeated behavior at the architectural level, not harmless syntax.",
    );
  }

  lines.push(
    "",
    "---",
    "",
    "Before changing code, perform these reasoning passes:",
    ...reasoningPasses.map((item, index) => `${index + 1}. ${item}`),
    "",
    "---",
    "",
    "Non-negotiables:",
    ...strictness.map((item) => `- ${item}`),
    "",
    "---",
    "",
    "Refactor strategy:",
    "",
    "High Priority:",
    ...dedupedHighPriority.map((item) => `- ${item}`),
  );

  const mediumPriority = buildMediumPriority(structuralRepetitions);

  if (mediumPriority.length > 0) {
    lines.push(
      "",
      "Medium Priority:",
      ...mediumPriority.map((item) => `- ${item}`),
    );
  }

  lines.push(
    "",
    "Low Priority:",
    "- Minor structural or stylistic cleanup.",
    "",
    "---",
    "",
    "Output Contract:",
    ...outputContract.map((item, index) => `${index + 1}. ${item}`),
    "",
    "---",
    "",
    "File:",
    filename || selectedProjectFile?.path || "unknown",
    "",
    "Code:",
    code,
  );

  return lines.join("\n");
}

function getGoalLine(config) {
  if (config.task === "test") {
    return "Generate tests that protect risky behavior before refactoring.";
  }

  if (config.task === "explain") {
    return "Explain the current structure, responsibilities, risks, and improvement path.";
  }

  if (config.task === "optimize") {
    return "Suggest targeted optimizations while preserving behavior.";
  }

  return "Make the hidden structure explicit without changing behavior.";
}

function buildMediumPriority(structuralRepetitions) {
  if (!structuralRepetitions.length) return [];

  return [
    "Extract reusable pipelines and shared utilities.",
    "Consolidate repeated logic where it improves clarity.",
    "Avoid broad abstractions that are not used at least twice.",
  ];
}

function formatListOrFallback(items, fallback) {
  if (!items.length) {
    return [`- ${fallback}`];
  }

  return items.map((item) => `- ${item}`);
}
