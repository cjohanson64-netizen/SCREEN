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
  high_token_count:
    "Reduce code density by extracting helpers and removing unnecessary inline logic.",
  many_functions:
    "Group related functions and separate responsibilities into dedicated modules.",
  deep_nesting:
    "Reduce nested logic with early returns, guard clauses, helper functions, or smaller components.",
  high_complexity:
    "Simplify decision-heavy logic and reduce branching where possible.",
  many_decisions:
    "Consolidate decision logic into named predicates, lookup maps, or strategy functions.",
  loop_heavy:
    "Review loops for repeated traversal and consider clearer pipelines, helper functions, or combined passes.",
  boolean_dense:
    "Extract complex boolean expressions into clearly named variables or predicate helper functions.",
  error_handling_heavy:
    "Centralize repeated error-handling paths and make failure behavior explicit.",
  repeated_patterns:
    "Consolidate repeated behavior into shared utilities, not low-level syntax repetition.",
};

const STRATEGY_BY_RISK = {
  needs_refactor:
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

  if (risks.includes("needs_refactor")) {
    lines.push("", "This file is considered high risk and should be refactored.");
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