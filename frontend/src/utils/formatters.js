export function formatReviewLabel(value) {
  return value
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatStructuralRepetition(type) {
  const labels = {
    math_windowing_logic: "Repeated math/windowing calculations",
    candidate_pipeline_logic:
      "Repeated candidate-building or candidate-filtering pipeline logic",
    span_splitting_logic:
      "Repeated span splitting, resplitting, or recovery logic",
    collection_transform_logic: "Repeated collection transformation chains",
    guard_condition_logic: "Repeated guard-condition or early-return logic",
  };

  return labels[type] ?? formatReviewLabel(type);
}

export function formatFindingRule(rule = "") {
  if (!rule) return "";

  return rule
    .split(".")                      // ["file", "too_large"]
    .map((part) =>
      part
        .split("_")                 // ["too", "large"]
        .map(capitalizeWord)
        .join(" ")
    )
    .join(": ");                    // "File: Too Large"
}

export function capitalizeWord(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getTabSeverity({
  findings = [],
  repetition = {},
  signals = [],
  risks = [],
  clusters = {},
}) {
  if (risks.length > 0) return "high";

  if (findings.some((finding) => finding.severity === "error")) {
    return "high";
  }

  if (findings.some((finding) => finding.severity === "warning")) {
    return "medium";
  }

  if (findings.some((finding) => finding.severity === "caution")) {
    return "low";
  }

  if (signals.length > 0) {
    return "medium";
  }

  const clusterHasSignals = Object.values(clusters).some(
    (items) => Array.isArray(items) && items.length > 0,
  );

  if (clusterHasSignals) {
    return "medium";
  }

  const reps = repetition.meaningfulRepetitions ?? [];

  if (reps.some((rep) => rep.severity === "high")) {
    return "medium";
  }

  if (reps.some((rep) => rep.severity === "medium")) {
    return "low";
  }

  return null;
}
