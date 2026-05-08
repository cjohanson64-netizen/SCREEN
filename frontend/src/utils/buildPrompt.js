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
    "Do not split this file because it is long. First identify whether it is cohesive, healthy orchestration, or carrying multiple hidden domains.",
  token_heavy:
    "Reduce code density only where named helpers expose a real responsibility boundary or repeated decision pattern.",
  function_heavy:
    "Group related functions by behavior domain; avoid arbitrary helper extraction that makes the flow harder to trace.",

  hook_heavy:
    "Extract useX functions only when they share a coherent state/workflow domain and improve ownership clarity.",
  component_heavy:
    "Extract the largest self-contained render-only child component first while preserving props, CSS classes, and visible behavior.",
  getter_heavy:
    "Group getX functions into selectors, data-access helpers, or query utilities only when they read the same data domain.",
  setter_heavy:
    "Group setX functions around the state or mutation domain they update; keep local setters local when they remain easy to trace.",
  predicate_heavy:
    "Move related hasX/isX/canX/shouldX rules into named predicate helpers when they encode reusable domain decisions.",
  analyzer_heavy:
    "Split analyzeX/detectX logic into focused analyzer modules with one clear orchestration entry point.",
  handler_heavy:
    "Group handleX/toggleX UI behavior by event domain, but keep small local handlers in place when the component remains readable.",
  builder_heavy:
    "Move buildX/createX/makeX functions into focused builder or factory helpers when they share a construction domain.",
  transformer_heavy:
    "Group parseX/formatX/normalizeX/transformX functions into transformation utilities by input/output responsibility.",
  io_heavy:
    "Move fetchX/loadX/saveX/sendX functions into service or data-access modules unless this file is already a service boundary.",
  orchestrator_heavy:
    "Make runX/executeX/applyX orchestration read as a clear sequence of named phases while preserving the public entry point.",

  block_heavy:
    "Review block-heavy areas for extractable responsibilities or excessive local structure; do not extract harmless local structure.",
  deeply_nested:
    "Reduce nested logic with guard clauses or named helpers only where the resulting behavior remains easier to verify.",
  long_lines:
    "Shorten dense lines by extracting named expressions, helpers, or configuration objects without changing thresholds or literals.",
  repetition_high:
    "Consolidate repeated behavior at the responsibility level, not low-level syntax repetition.",
  complexity_high:
    "Interpret complexity through file role and domain cohesion before recommending a refactor.",
  decision_heavy:
    "Consolidate decision logic into named predicates, lookup maps, or strategy functions when the decisions belong to one rule cluster.",
  loop_heavy:
    "Review loops for exit clarity, mutation safety, and repeated traversal before extracting or combining passes.",
  boolean_heavy:
    "Extract complex boolean expressions into clearly named predicates only when the names reveal stable domain meaning.",
  error_handling_heavy:
    "Centralize repeated error-handling paths only when the same failure behavior repeats across workflow steps.",

  constant_heavy:
    "Group constants by responsibility so configuration, flags, rules, and render projections are easier to locate.",
  boolean_constant_heavy:
    "Group related isX/hasX/canX/shouldX constants into predicate helpers, guard helpers, or focused rule modules.",
  threshold_constant_heavy:
    "Move related MAX/MIN/DEFAULT/LIMIT/THRESHOLD constants into a config or scoring-rules module without changing values.",
  flag_constant_heavy:
    "Group UI and state flags by screen region or state domain; avoid hiding simple local state behind unnecessary abstractions.",
  decision_rule_constant_heavy:
    "Move reusable decision-rule constants into named rule helpers or predicate modules.",
  predicate_constant_heavy:
    "Extract predicate-style constants into named boolean helpers where it improves clarity and testability.",
  capability_constant_heavy:
    "Group canX/allowsX capability constants into permission or capability rule helpers.",
  requirement_rule_constant_heavy:
    "Group needsX/requiresX constants into requirement-rule helpers.",
  feature_flag_constant_heavy:
    "Group enableX/disableX constants into feature-flag configuration when the flags are reused or product-facing.",
  visibility_flag_heavy:
    "Group showX/hideX/visibleX constants into visibility-rule helpers when visibility logic spans multiple UI regions.",
  state_flag_heavy:
    "Group selectedX/openX/loadingX/errorX constants by UI state domain or screen region.",
  validation_flag_heavy:
    "Group validX/invalidX constants into validation rule helpers.",
  render_data_projection:
    "Extract render-derived constants into a selector, view-model helper, or custom hook only if render preparation is becoming its own domain.",
  entity_alias_heavy:
    "Group related entity aliases or move render-data preparation into a selector/helper when it improves traceability.",
  collection_alias_heavy:
    "Group collection aliases and collection preparation into a focused helper when display data construction is growing.",
  derived_value_heavy:
    "Group derived values by responsibility and consider a view-model helper for render preparation.",
  boolean_expression_constant_heavy:
    "Group boolean expression constants into predicate helpers or guard helpers when they encode reusable rules.",
  action_guard_heavy:
    "Extract action guard constants into named predicate helpers or interaction-rule helpers.",
  function_expression_constant_heavy:
    "Review const function expressions as functions, not ordinary constants, and group them with function responsibilities.",
  view_model_pressure:
    "Extract inline view-model construction into a selector, custom hook, or focused view-model helper only when it has become a stable presentation boundary.",

  import_heavy:
    "Interpret import volume through file role: broad imports may be healthy in app/page shells but suspicious in utilities, services, or domain files.",
  external_import_heavy:
    "Review external package dependencies and keep integration logic isolated where possible.",
  local_import_heavy:
    "Review local project dependencies and reduce coupling only where responsibility boundaries are unclear.",
  deep_relative_import_heavy:
    "Replace deep relative imports with clearer nearby modules or project aliases only when it improves ownership clarity.",
  wide_named_import_heavy:
    "Review wide named imports and split or narrow dependency surfaces where the imported responsibilities are mixed.",
  import_responsibility_spread:
    "Use domain-specific extraction if imports prove multiple independent responsibility zones are mixed in one file.",
  ui_imports_data_access:
    "Move direct data-access work out of UI rendering code unless this file is intentionally a page/app orchestration shell.",
  ui_imports_domain_logic:
    "Review whether domain rules are used only for rendering or whether deeper decisions should move into selectors/predicates.",
  production_imports_test_support:
    "Remove production dependencies on fixtures, mocks, stubs, or test helpers when the import path clearly proves test-support usage.",

  export_heavy:
    "Review whether the file is an intentional public API surface or a module that should split unrelated exports by domain.",
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
    "Treat this as an extension-risk candidate, but use refactor-worthiness and domain-cohesion context to choose the smallest safe move.",
};

const RECOMMENDATION_TEXT = {
  no_immediate_refactor:
    "No immediate code change. Keep the current structure unless new behavior expands the same pressure point.",
  watch_for_growth:
    "Watch this file for growth. Do not refactor yet unless new behavior repeats the same workflow, error path, or projection pattern.",
  targeted_rule_cluster_extraction:
    "Use a targeted extraction: move one cohesive rule/predicate/strategy cluster, not the whole file.",
  domain_specific_extraction:
    "Extract focused domain modules while preserving the current public orchestration entry point.",
  preserve_public_composition_shell:
    "Preserve the public composition shell. Keep the current file as the top-level coordinator unless the shell itself is unclear.",
  refactor_before_adding_behavior:
    "Refactor before adding new behavior, but make the first pass behavior-preserving and narrowly scoped.",
  watch_cohesive_complexity:
    "Complexity appears domain-cohesive. Prefer watch or a small rule-cluster extraction over broad splitting.",
};

const EXTRACTION_STEP_TEXT = {
  defer_extraction_watch_first:
    "No extraction should be the first move. Watch this file until a repeated workflow or domain boundary becomes clearer.",
  render_only_component_first:
    "Extract the largest self-contained render-only component first. This usually has the lowest behavior risk because it preserves state and workflow ownership.",
  display_view_model_helper_first:
    "Extract display/view-model preparation first. Keep rendered values, fallback behavior, and prop shapes unchanged.",
  predicate_rule_cluster_first:
    "Extract one predicate/rule cluster first. This is safer than splitting the file broadly when complexity is domain-cohesive.",
  workflow_hook_first:
    "Extract one workflow hook first. Preserve the public page/component shell and keep event behavior traceable.",
  service_boundary_first:
    "Extract or clarify the service/data boundary first. Keep UI rendering stable and move data access behind a hook or service wrapper.",
  domain_module_first:
    "Extract one focused domain module first. Split by responsibility boundary, not by arbitrary helper size.",
  public_api_grouping_first:
    "Group the public API/export surface first. Preserve existing exports unless explicitly instructed otherwise.",
};

const EXTRACTION_REASON_TEXT = {
  lowest_behavior_risk:
    "Lowest behavior risk compared with broader module splitting.",
  preserves_public_shell:
    "Preserves the current public composition/orchestration shell.",
  keeps_rules_traceable:
    "Keeps rule logic easier to trace and verify.",
  keeps_render_output_stable:
    "Keeps rendered output and view behavior stable.",
  reduces_cross_domain_touch_points:
    "Reduces the number of unrelated domains touched by future changes.",
  protects_public_api:
    "Protects existing public imports/exports and avoids breaking consumers.",
};

const CONFIDENCE_TEXT = {
  high:
    "High confidence: SCREEN found direct evidence and this warning can be treated as actionable.",
  medium:
    "Medium confidence: SCREEN found category evidence, but the boundary should be confirmed before refactoring.",
  low:
    "Low confidence: SCREEN found weak evidence. Treat this as a watch item, not a refactor trigger.",
};

const SIGNAL_TEXT = {
  healthy_orchestration_density:
    "The file appears dense because it is coordinating behavior, not necessarily because it owns too much behavior.",
  app_root_orchestration_density:
    "App-root orchestration density is expected. Broad imports and handlers can be healthy here when ownership is delegated.",
  page_shell_composition_density:
    "Page-shell composition density is expected. Refactor only if the page owns multiple independent workflows.",
  single_domain_rule_complexity:
    "The complexity appears to come from one cohesive rule domain. Use a small extraction, not a broad module split.",
  multi_domain_responsibility_mixing:
    "The file appears to mix multiple independent responsibility domains. Split along domain boundaries, not arbitrary size.",
  behavior_ownership_drift:
    "The file appears to be accumulating behavior ownership that may belong in hooks, services, selectors, or focused modules.",
  very_high_extension_risk:
    "The file has high extension risk. New features should wait until the riskiest behavior boundary is clarified.",
  cohesive_rule_domain:
    "The active signals look like one rule domain rather than unrelated mixed responsibilities.",
  cohesive_utility_domain:
    "The active signals look like one utility/helper domain.",
  cohesive_service_domain:
    "The active signals look like one service/data-access domain.",
  cohesive_component_domain:
    "The active signals look like one component/UI domain.",
  page_multi_domain_coordinator:
    "The page appears to coordinate multiple feature domains. Keep the page shell and extract the clearest feature domain first.",
  app_multi_domain_coordinator:
    "The app shell appears to coordinate multiple domains. Preserve the shell and extract behavior only where ownership is unclear.",
  import_domain_spread:
    "Import categories show responsibility spread. Use imports as evidence for domain boundaries.",
  workflow_domain_spread:
    "Workflow signals indicate multiple behavior domains may be mixed.",
  render_and_behavior_mixed:
    "Render preparation and behavior logic appear mixed. Consider a view-model helper or hook if the pattern repeats.",
  data_and_ui_mixed:
    "Data access and UI responsibility appear mixed. Move data access behind a hook/service unless this is a page/app shell.",
};

const FILE_ROLE_TEXT = {
  app_root:
    "Treat this as an app-root orchestration file. Broad imports can be healthy if the file mostly wires hooks, routes, modals, and pages together.",
  page_shell:
    "Treat this as a page composition shell. Keep the page as the public entry point and extract feature domains only when ownership is mixed.",
  component_file:
    "Treat this as a component file. Rendering and props are expected; direct data access and domain decisions need stronger evidence.",
  modal_component:
    "Treat this as a focused interaction component. Keep local open/close behavior local unless it grows into a workflow domain.",
  hook_file:
    "Treat this as a behavior/state hook. Effects, state, and handlers are expected; watch for unrelated domains in one hook.",
  service_file:
    "Treat this as a service/data boundary. Async and IO are expected; UI rendering imports are low-tolerance.",
  domain_core_file:
    "Treat this as domain or rule logic. Branching can be normal; UI/data-access imports are low-tolerance.",
  utility_file:
    "Treat this as a utility/helper file. Keep cohesion high and avoid turning it into a grab bag.",
  feature_module_file:
    "Treat this as a feature-owned module. Mixed UI/hooks/services can be acceptable if contained in one feature boundary.",
  state_module_file:
    "Treat this as state management. State transitions and selectors are expected; rendering and unrelated IO are low-tolerance.",
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
  tatReview = {},
  analysisScopes = ["full"],
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
  const promptContext = buildPromptContext(tatReview, analysisScopes);

  const causes = signals
    .filter((signal) => signal !== "repeated_patterns")
    .map(formatReviewLabel);

  const structuralRepetitions =
    repetition?.structuralRepetitions?.slice(0, 5) ?? [];

  const highPriority = buildHighPriority({
    signals,
    risks,
    tatReview,
  });

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
    getGoalLine(promptConfig, tatReview),
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
    "Prompt Decision Hierarchy:",
    "1. Respect selected analysis scopes.",
    "2. Interpret signals through the file role.",
    "3. Use domain cohesion to decide between watch, targeted extraction, or domain split.",
    "4. Treat signal confidence as evidence strength, not decoration.",
    "5. Follow the safest extraction order before attempting larger refactors.",
    "6. Preserve public shells, exports, behavior, thresholds, and rendered output.",
    "",
    "---",
    "",
    "SCREEN Architecture-Aware Interpretation:",
    ...promptContext,
    "",
    "---",
    "",
    "Primary issues detected:",
    ...formatListOrFallback(causes, "No major issues detected."),
  );

  const urgency = tatReview?.refactorUrgency ?? "none";

  if (urgency === "watch") {
    lines.push(
      "",
      "Refactor-worthiness note:",
      "This file is in watch mode. Do not perform a broad refactor. Recommend no immediate code change or the smallest safe extraction only if the repeated pattern is clear.",
    );
  } else if (urgency === "recommended") {
    lines.push(
      "",
      "Refactor-worthiness note:",
      "A behavior-preserving refactor is recommended, but the scope must be limited to the clearest responsibility boundary.",
    );
  } else if (urgency === "urgent" || risks.includes("risky_to_extend")) {
    lines.push(
      "",
      "Refactor-worthiness note:",
      "This file has high extension risk. Refactor before adding new behavior, but keep the first pass behavior-preserving and focused on the safest boundary.",
    );
  }

  if (findings.length > 0) {
    lines.push(
      "",
      "Actionable findings:",
      ...findings.map(
        (finding) =>
          `- ${finding.rule}: ${finding.message} Next action: ${formatFindingNextAction(finding, tatReview)}`,
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
    "- Do not introduce changes outside the selected analysis scopes unless needed to preserve behavior.",
    "- Do not split files merely because they are long or signal-heavy.",
    "- Preserve the current public composition/orchestration entry point unless the prompt explicitly identifies it as the extraction target.",
    "- Choose the smallest safe architectural move that addresses the diagnosed responsibility boundary.",
    "- Treat low-confidence and medium-confidence boundary signals as review evidence, not automatic refactor triggers.",
    "",
    "---",
    "",
  );

  const extractionSteps = tatReview?.extractionSteps ?? [];

  if (extractionSteps.length) {
    lines.push(
      "Safest extraction order:",
      ...extractionSteps.map(
        (step, index) =>
          `${index + 1}. ${EXTRACTION_STEP_TEXT[step] ?? formatReviewLabel(step)}`,
      ),
      "",
      "---",
      "",
    );
  }

  lines.push(
    "Refactor strategy:",
    "",
    "High Priority:",
    ...dedupedHighPriority.map((item) => `- ${item}`),
  );

  const mediumPriority = buildMediumPriority(structuralRepetitions, tatReview);

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
    "Final instruction:",
    buildFinalInstruction(tatReview, analysisScopes),
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

function buildHighPriority({ signals = [], risks = [], tatReview = {} }) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const recommendations = tatReview.refactorRecommendations ?? [];
  const domainRecommendations = tatReview.domainRecommendations ?? [];
  const extractionSteps = tatReview.extractionSteps ?? [];
  const domainCohesion = tatReview.domainCohesion ?? "unknown";
  const fileRoles = tatReview.fileRoles ?? [];

  const contextualStrategies = [
    ...recommendations.map((item) => RECOMMENDATION_TEXT[item]).filter(Boolean),
    ...domainRecommendations.map((item) => RECOMMENDATION_TEXT[item]).filter(Boolean),
  ];

  contextualStrategies.push(
    ...extractionSteps
      .map((step) => EXTRACTION_STEP_TEXT[step])
      .filter(Boolean),
  );

  if (fileRoles.includes("app_root")) {
    contextualStrategies.push(
      "Keep the app file as the public orchestration shell. Extract only behavior that has unclear ownership or repeated workflows.",
    );
  }

  if (fileRoles.includes("page_shell")) {
    contextualStrategies.push(
      "Keep the page file as the public composition shell. Extract the largest self-contained feature domain first.",
    );
  }

  if (domainCohesion === "cohesive") {
    contextualStrategies.push(
      "Because the file appears domain-cohesive, prefer a targeted rule/strategy/helper extraction over broad module splitting.",
    );
  }

  if (domainCohesion === "mixed") {
    contextualStrategies.push(
      "Because the file appears multi-domain, name the responsibility boundaries and split by domain rather than helper size.",
    );
  }

  const signalStrategies = signals
    .map((signal) => STRATEGY_BY_SIGNAL[signal])
    .filter(Boolean);

  const riskStrategies = risks
    .map((risk) => STRATEGY_BY_RISK[risk])
    .filter(Boolean);

  if (urgency === "none" || urgency === "watch") {
    return [
      ...contextualStrategies,
      "Treat detected signals as watch items, not automatic implementation triggers.",
      ...signalStrategies.slice(0, 4),
    ];
  }

  return [
    ...riskStrategies,
    ...contextualStrategies,
    ...signalStrategies,
  ];
}

function buildPromptContext(tatReview = {}, analysisScopes = ["full"]) {
  const fileRoles = tatReview.fileRoles ?? [];
  const expectedTraits = tatReview.expectedTraits ?? {};
  const lowToleranceTraits = tatReview.lowToleranceTraits ?? {};
  const urgency = tatReview.refactorUrgency ?? "none";
  const worthinessSignals = tatReview.refactorWorthinessSignals ?? [];
  const refactorRecommendations = tatReview.refactorRecommendations ?? [];
  const domainCohesion = tatReview.domainCohesion ?? "unknown";
  const activeDomains = tatReview.activeDomains ?? [];
  const domainSignals = tatReview.domainSignals ?? [];
  const domainRecommendations = tatReview.domainRecommendations ?? [];
  const extractionSteps = tatReview.extractionSteps ?? [];
  const extractionReasonMap = tatReview.extractionReasonMap ?? {};
  const signalConfidence = tatReview.signalConfidence ?? {};

  const lines = [];

  lines.push(
    `- Selected analysis scopes: ${analysisScopes.map(formatReviewLabel).join(", ")}`,
  );

  if (fileRoles.length) {
    lines.push(
      `- File role: ${fileRoles.map(formatReviewLabel).join(", ")}`,
      ...fileRoles
        .map((role) => FILE_ROLE_TEXT[role])
        .filter(Boolean)
        .map((text) => `- Role interpretation: ${text}`),
    );
  } else {
    lines.push(
      "- File role: Unknown",
      "- Role interpretation: Do not infer a refactor boundary from path context alone.",
    );
  }

  const expected = uniqueValuesForRoles(fileRoles, expectedTraits);
  const lowTolerance = uniqueValuesForRoles(fileRoles, lowToleranceTraits);

  if (expected.length) {
    lines.push(
      `- Expected traits: ${expected.map(formatReviewLabel).join(", ")}`,
    );
  }

  if (lowTolerance.length) {
    lines.push(
      `- Low-tolerance traits: ${lowTolerance.map(formatReviewLabel).join(", ")}`,
    );
  }

  lines.push(`- Refactor urgency: ${formatReviewLabel(urgency)}`);

  if (worthinessSignals.length) {
    lines.push(
      "- Refactor-worthiness signals:",
      ...worthinessSignals.map(
        (signal) =>
          `  - ${formatReviewLabel(signal)}: ${
            SIGNAL_TEXT[signal] ??
            "Use this as context for choosing refactor scope."
          }`,
      ),
    );
  }

  if (refactorRecommendations.length) {
    lines.push(
      "- Refactor recommendations:",
      ...refactorRecommendations.map(
        (item) => `  - ${RECOMMENDATION_TEXT[item] ?? formatReviewLabel(item)}`,
      ),
    );
  }

  lines.push(`- Domain cohesion: ${formatReviewLabel(domainCohesion)}`);

  if (activeDomains.length) {
    lines.push(
      `- Active responsibility domains: ${activeDomains
        .map(formatReviewLabel)
        .join(", ")}`,
    );
  }

  if (domainSignals.length) {
    lines.push(
      "- Domain cohesion signals:",
      ...domainSignals.map(
        (signal) =>
          `  - ${formatReviewLabel(signal)}: ${
            SIGNAL_TEXT[signal] ??
            "Use this as context for responsibility boundaries."
          }`,
      ),
    );
  }

  if (domainRecommendations.length) {
    lines.push(
      "- Domain recommendations:",
      ...domainRecommendations.map(
        (item) => `  - ${RECOMMENDATION_TEXT[item] ?? formatReviewLabel(item)}`,
      ),
    );
  }

  if (extractionSteps.length) {
    lines.push(
      "- Safest extraction order:",
      ...extractionSteps.map((step, index) => {
        const reasons = extractionReasonMap[step] ?? [];
        const reasonText = reasons.length
          ? ` Reasons: ${reasons
              .map(
                (reason) =>
                  EXTRACTION_REASON_TEXT[reason] ?? formatReviewLabel(reason),
              )
              .join(" ")}`
          : "";

        return `  ${index + 1}. ${
          EXTRACTION_STEP_TEXT[step] ?? formatReviewLabel(step)
        }${reasonText}`;
      }),
    );
  } else {
    lines.push(
      "- Safest extraction order: No extraction order was produced. Prefer review/watch language unless a clear boundary is proven.",
    );
  }

  const confidenceEntries = Object.entries(signalConfidence);

  if (confidenceEntries.length) {
    lines.push(
      "- Signal confidence and evidence:",
      ...confidenceEntries.flatMap(([signal, details]) => {
        const level = details?.level ?? "low";
        const reason = details?.reason;
        const evidence = details?.evidence ?? [];

        return [
          `  - ${formatReviewLabel(signal)}: ${
            CONFIDENCE_TEXT[level] ?? formatReviewLabel(level)
          }`,
          ...(reason ? [`    Reason: ${reason}`] : []),
          ...evidence
            .slice(0, 5)
            .map((item) => `    Evidence: ${item.source} (${item.reason})`),
        ];
      }),
    );
  } else {
    lines.push(
      "- Signal confidence and evidence: No evidence-backed boundary warnings were emitted.",
    );
  }

  lines.push(
    "- Final decision rule: Signals trigger interpretation, not automatic implementation.",
  );

  return lines;
}

function uniqueValuesForRoles(roles = [], traitMap = {}) {
  return Array.from(new Set(roles.flatMap((role) => traitMap[role] ?? [])));
}

function getGoalLine(config, tatReview = {}) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const domainCohesion = tatReview.domainCohesion ?? "unknown";

  if (config.task === "test") {
    return "Generate tests that protect risky behavior before refactoring.";
  }

  if (config.task === "explain") {
    return "Explain the current structure, responsibilities, risks, and improvement path.";
  }

  if (config.task === "optimize") {
    return "Suggest targeted optimizations while preserving behavior.";
  }

  if (urgency === "none" || urgency === "watch") {
    return "Evaluate whether a refactor is actually worthwhile. Recommend watch/no immediate change unless a clear responsibility boundary is proven.";
  }

  if (domainCohesion === "cohesive") {
    return "Make one targeted rule/helper/strategy boundary explicit without broad file splitting or behavior changes.";
  }

  if (domainCohesion === "mixed") {
    return "Make the hidden responsibility domains explicit and extract the safest focused domain while preserving behavior.";
  }

  return "Make the hidden structure explicit without changing behavior.";
}

function formatFindingNextAction(finding, tatReview = {}) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const domainCohesion = tatReview.domainCohesion ?? "unknown";
  const fileRoles = tatReview.fileRoles ?? [];
  const signalConfidence = tatReview.signalConfidence ?? {};
    const confidenceMatch = Object.entries(signalConfidence).find(
    ([signal]) => finding.id?.includes(signal) || finding.rule?.includes(signal),
  );

  if (confidenceMatch) {
    const [, details] = confidenceMatch;
    const level = details?.level ?? "low";

    if (level !== "high") {
      return "Confirm this boundary warning before refactoring. Treat it as evidence, not proof.";
    }
  }

  if (urgency === "none" || urgency === "watch") {
    return "Treat this as a watch item unless the same pattern repeats or new behavior is being added.";
  }

  if (domainCohesion === "cohesive") {
    return "Extract the smallest cohesive rule/helper cluster related to this finding, not a broad module split.";
  }

  if (domainCohesion === "mixed") {
    return "Name the domain boundary this finding belongs to and extract that focused domain first.";
  }

  if (fileRoles.includes("app_root") || fileRoles.includes("page_shell")) {
    return "Preserve the public composition shell and extract only the behavior domain that is unclear or repeated.";
  }

  return finding.nextAction;
}

function buildMediumPriority(structuralRepetitions, tatReview = {}) {
  const items = [];

  if (structuralRepetitions.length) {
    items.push(
      "Extract reusable pipelines and shared utilities only when repeated behavior has the same semantic purpose.",
      "Consolidate repeated logic where it improves clarity.",
      "Avoid broad abstractions that are not used at least twice.",
    );
  }

  const urgency = tatReview.refactorUrgency ?? "none";

  if (urgency === "none" || urgency === "watch") {
    items.push(
      "Prefer documentation, naming, or no-change recommendations over implementation prompts when the file remains readable.",
    );
  }

  return items;
}

function buildFinalInstruction(tatReview = {}, analysisScopes = ["full"]) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const domainCohesion = tatReview.domainCohesion ?? "unknown";
  const extractionSteps = tatReview.extractionSteps ?? [];
  const signalConfidence = tatReview.signalConfidence ?? {};
  const hasOnlyLowConfidenceSignals =
    Object.values(signalConfidence).length > 0 &&
    Object.values(signalConfidence).every((details) => details?.level !== "high");

  const scopeText = analysisScopes.map(formatReviewLabel).join(", ");

  if (urgency === "none") {
    return `This analysis is scoped to ${scopeText}. Recommend no refactor unless the code clearly violates the selected scope. Explain why no change is needed if the file is healthy.`;
  }

  if (urgency === "watch") {
    return `This analysis is scoped to ${scopeText}. Treat this as watch mode. Do not implement a broad refactor; recommend no immediate change or the smallest cleanup only.`;
  }

  if (hasOnlyLowConfidenceSignals) {
    return `This analysis is scoped to ${scopeText}. Boundary signals are not high-confidence, so verify the evidence before recommending implementation. Prefer a review plan over code changes.`;
  }

  if (extractionSteps.length) {
    return `This analysis is scoped to ${scopeText}. Start with the first safest extraction step: ${
      EXTRACTION_STEP_TEXT[extractionSteps[0]] ?? formatReviewLabel(extractionSteps[0])
    }`;
  }

  if (domainCohesion === "cohesive") {
    return `This analysis is scoped to ${scopeText}. Prefer one targeted rule/helper/strategy extraction instead of broad module splitting.`;
  }

  if (domainCohesion === "mixed") {
    return `This analysis is scoped to ${scopeText}. Split by named domain boundary and preserve the public shell.`;
  }

  return `This analysis is scoped to ${scopeText}. Make only behavior-preserving changes justified by the selected signals.`;
}

function formatListOrFallback(items, fallback) {
  if (!items.length) {
    return [`- ${fallback}`];
  }

  return items.map((item) => `- ${item}`);
}