import { DEFAULT_PROMPT_CONFIG } from "../constants/promptOptions";

export function buildPromptConfigFromAnalysis({
  filename = "",
  signals = [],
  risks = [],
  findings = [],
  repetition = {},
} = {}) {
  return {
    ...DEFAULT_PROMPT_CONFIG,
    task: inferTask({ risks, findings }),
    targetArchitecture: inferTargetArchitecture({
      filename,
      signals,
      repetition,
    }),
    strictness: inferStrictness({ risks }),
    outputFormat: inferOutputFormat({ risks }),
    riskLevel: inferRiskLevel({ risks, findings, signals }),
    domain: inferDomain({ filename, repetition }),
  };
}

function inferTask({ risks = [], findings = [] }) {
  if (risks.includes("needs_refactor")) {
    return "refactor";
  }

  if (findings.length > 0) {
    return "review";
  }

  return DEFAULT_PROMPT_CONFIG.task;
}

function inferTargetArchitecture({ filename = "", signals = [], repetition = {} }) {
  const language = detectLanguage(filename);
  const structuralTypes = getStructuralRepetitionTypes(repetition);

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

  if (signals.includes("many_functions")) {
    return "service_layer";
  }

  if (signals.includes("many_decisions") || signals.includes("boolean_dense")) {
    return "state_machine";
  }

  return DEFAULT_PROMPT_CONFIG.targetArchitecture;
}

function inferStrictness({ risks = [] }) {
  if (risks.includes("needs_refactor")) {
    return "behavior_preserving";
  }

  return DEFAULT_PROMPT_CONFIG.strictness;
}

function inferOutputFormat({ risks = [] }) {
  if (risks.includes("needs_refactor")) {
    return "full_files";
  }

  return DEFAULT_PROMPT_CONFIG.outputFormat;
}

function inferRiskLevel({ risks = [], findings = [], signals = [] }) {
  if (risks.length > 0) {
    return "high";
  }

  if (findings.some((finding) => finding.severity === "error")) {
    return "high";
  }

  if (
    findings.some((finding) => finding.severity === "warning") ||
    signals.includes("high_complexity")
  ) {
    return "medium";
  }

  return "low";
}

function inferDomain({ filename = "", repetition = {} }) {
  const lower = filename.toLowerCase();
  const structuralTypes = getStructuralRepetitionTypes(repetition);

  if (
    structuralTypes.includes("math_windowing_logic") ||
    structuralTypes.includes("span_splitting_logic") ||
    structuralTypes.includes("candidate_pipeline_logic")
  ) {
    return "audio";
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