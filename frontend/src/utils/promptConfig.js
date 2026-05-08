import { DEFAULT_PROMPT_CONFIG } from "../constants/promptOptions";

export function buildPromptConfigFromAnalysis({
  filename = "",
  signals = [],
  risks = [],
  findings = [],
  repetition = {},
  tatReview = {},
  analysisScopes = ["full"],
} = {}) {
  return {
    ...DEFAULT_PROMPT_CONFIG,
    task: inferTask({ risks, findings, tatReview }),
    targetArchitecture: inferTargetArchitecture({
      filename,
      signals,
      repetition,
      tatReview,
      analysisScopes,
    }),
    strictness: inferStrictness({ risks, tatReview }),
    outputFormat: inferOutputFormat({ risks, tatReview }),
    riskLevel: inferRiskLevel({ risks, findings, signals, tatReview }),
    domain: inferDomain({ filename, repetition, tatReview }),
  };
}

function inferTask({ risks = [], findings = [], tatReview = {} }) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const confidenceSummary = summarizeSignalConfidence(tatReview.signalConfidence);

  if (urgency === "none" || urgency === "watch") {
    return "review";
  }

  if (confidenceSummary.hasOnlyLowConfidenceBoundarySignals) {
    return "review";
  }

  if (risks.includes("risky_to_extend") || urgency === "urgent") {
    return "refactor";
  }

  if (urgency === "recommended") {
    return "refactor";
  }

  if (findings.length > 0) {
    return "review";
  }

  return DEFAULT_PROMPT_CONFIG.task;
}

function inferTargetArchitecture({
  filename = "",
  signals = [],
  repetition = {},
  tatReview = {},
  analysisScopes = ["full"],
}) {
  const language = detectLanguage(filename);
  const structuralTypes = getStructuralRepetitionTypes(repetition);
  const fileRoles = tatReview.fileRoles ?? [];
  const domainCohesion = tatReview.domainCohesion ?? "unknown";
  const domainRecommendations = tatReview.domainRecommendations ?? [];
  const refactorRecommendations = tatReview.refactorRecommendations ?? [];
  const extractionSteps = tatReview.extractionSteps ?? [];
  const scopes = new Set(analysisScopes);

  if (
    fileRoles.includes("app_root") ||
    fileRoles.includes("page_shell") ||
    refactorRecommendations.includes("preserve_public_composition_shell") ||
    extractionSteps.includes("render_only_component_first") ||
    extractionSteps.includes("workflow_hook_first")
  ) {
    return "adapter_orchestrator";
  }

  if (
    domainCohesion === "mixed" ||
    domainRecommendations.includes("domain_specific_extraction") ||
    refactorRecommendations.includes("domain_specific_extraction") ||
    extractionSteps.includes("domain_module_first")
  ) {
    return "service_layer";
  }

  if (
    domainCohesion === "cohesive" ||
    refactorRecommendations.includes("targeted_rule_cluster_extraction") ||
    extractionSteps.includes("predicate_rule_cluster_first")
  ) {
    return "state_machine";
  }

  if (extractionSteps.includes("service_boundary_first")) {
    return "service_layer";
  }

  if (extractionSteps.includes("display_view_model_helper_first")) {
    return "component_composition";
  }

  if (extractionSteps.includes("public_api_grouping_first")) {
    return "service_layer";
  }

  if (structuralTypes.includes("candidate_pipeline_logic")) {
    return "pipeline";
  }

  if (structuralTypes.includes("span_splitting_logic")) {
    return "pipeline";
  }

  if (structuralTypes.includes("collection_transform_logic")) {
    return "pipeline";
  }

  if (language === "css") {
    return "component_composition";
  }

  if (scopes.has("imports") || scopes.has("exports")) {
    return "service_layer";
  }

  if (signals.includes("many_functions") || signals.includes("function_heavy")) {
    return "service_layer";
  }

  if (
    signals.includes("many_decisions") ||
    signals.includes("boolean_dense") ||
    signals.includes("decision_heavy") ||
    signals.includes("boolean_heavy")
  ) {
    return "state_machine";
  }

  return DEFAULT_PROMPT_CONFIG.targetArchitecture;
}

function inferStrictness({ risks = [], tatReview = {} }) {
  const urgency = tatReview.refactorUrgency ?? "none";

  if (
    risks.includes("risky_to_extend") ||
    urgency === "recommended" ||
    urgency === "urgent"
  ) {
    return "behavior_preserving";
  }

  return DEFAULT_PROMPT_CONFIG.strictness;
}

function inferOutputFormat({ risks = [], tatReview = {} }) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const confidenceSummary = summarizeSignalConfidence(tatReview.signalConfidence);

  if (urgency === "none" || urgency === "watch") {
    return "explanation";
  }

  if (confidenceSummary.hasOnlyLowConfidenceBoundarySignals) {
    return "explanation";
  }

  if (risks.includes("risky_to_extend") || urgency === "urgent") {
    return "full_files";
  }

  if (urgency === "recommended") {
    return "plan";
  }

  return DEFAULT_PROMPT_CONFIG.outputFormat;
}

function inferRiskLevel({ risks = [], findings = [], signals = [], tatReview = {} }) {
  const urgency = tatReview.refactorUrgency ?? "none";
  const confidenceSummary = summarizeSignalConfidence(tatReview.signalConfidence);

  if (urgency === "urgent") {
    return "high";
  }

  if (urgency === "recommended") {
    return confidenceSummary.hasHighConfidenceBoundarySignal ? "medium" : "low";
  }

  if (urgency === "watch") {
    return "low";
  }

  if (risks.length > 0) {
    return "high";
  }

  if (findings.some((finding) => finding.severity === "error")) {
    return "high";
  }

  if (
    findings.some((finding) => finding.severity === "warning") ||
    signals.includes("high_complexity") ||
    signals.includes("complexity_high")
  ) {
    return "medium";
  }

  return "low";
}

function inferDomain({ filename = "", repetition = {}, tatReview = {} }) {
  const lower = filename.toLowerCase();
  const structuralTypes = getStructuralRepetitionTypes(repetition);
  const fileRoles = tatReview.fileRoles ?? [];

  if (
    structuralTypes.includes("math_windowing_logic") ||
    structuralTypes.includes("span_splitting_logic") ||
    structuralTypes.includes("candidate_pipeline_logic")
  ) {
    return "audio";
  }

  if (
    fileRoles.includes("component_file") ||
    fileRoles.includes("page_shell") ||
    fileRoles.includes("app_root")
  ) {
    return "frontend";
  }

  if (
    fileRoles.includes("service_file") ||
    fileRoles.includes("domain_core_file") ||
    fileRoles.includes("utility_file")
  ) {
    return "backend";
  }

  if (
    lower.endsWith(".jsx") ||
    lower.endsWith(".tsx") ||
    lower.endsWith(".css")
  ) {
    return "frontend";
  }

  if (
    lower.endsWith(".py") ||
    lower.endsWith(".java") ||
    lower.endsWith(".go")
  ) {
    return "backend";
  }

  return DEFAULT_PROMPT_CONFIG.domain;
}

function summarizeSignalConfidence(signalConfidence = {}) {
  const entries = Object.values(signalConfidence);
  const boundaryEntries = entries.filter((details) =>
    isBoundarySignal(details),
  );

  return {
    hasHighConfidenceBoundarySignal: boundaryEntries.some(
      (details) => details?.level === "high",
    ),
    hasOnlyLowConfidenceBoundarySignals:
      boundaryEntries.length > 0 &&
      boundaryEntries.every((details) => details?.level !== "high"),
  };
}

function isBoundarySignal(details = {}) {
  const reason = details?.reason ?? "";

  return (
    reason.includes("UI") ||
    reason.includes("data-access") ||
    reason.includes("domain") ||
    reason.includes("test") ||
    reason.includes("mock") ||
    reason.includes("fixture")
  );
}

function getStructuralRepetitionTypes(repetition = {}) {
  return (repetition.structuralRepetitions ?? []).map((item) => item.type);
}

function detectLanguage(filename = "") {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".jsx") || lower.endsWith(".js")) return "js";
  if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "ts";
  if (lower.endsWith(".py")) return "python";
  if (lower.endsWith(".java")) return "java";

  return "unknown";
}