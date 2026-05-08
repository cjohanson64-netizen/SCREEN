import { useMemo, useState } from "react";
import { buildPrompt } from "../utils/buildPrompt";
import { buildPromptConfigFromAnalysis } from "../utils/promptConfig";
import { formatReviewLabel } from "../utils/formatters";
import PromptConfigPanel from "./PromptConfigPanel";

const HIGH_IMPACT_SIGNALS = new Set([
  "long_file",
  "token_heavy",
  "function_heavy",

  "hook_heavy",
  "component_heavy",
  "getter_heavy",
  "predicate_heavy",
  "analyzer_heavy",
  "handler_heavy",
  "builder_heavy",
  "transformer_heavy",
  "io_heavy",
  "orchestrator_heavy",

  "constant_heavy",
  "boolean_constant_heavy",
  "threshold_constant_heavy",
  "flag_constant_heavy",
  "decision_rule_constant_heavy",
  "predicate_constant_heavy",
  "capability_constant_heavy",
  "requirement_rule_constant_heavy",
  "feature_flag_constant_heavy",
  "visibility_flag_heavy",
  "state_flag_heavy",
  "validation_flag_heavy",

  "block_heavy",
  "deeply_nested",
  "long_lines",
  "repetition_high",
  "complexity_high",
  "decision_heavy",
  "loop_heavy",
  "boolean_heavy",
  "error_handling_heavy",

  "render_data_projection",
  "entity_alias_heavy",
  "collection_alias_heavy",
  "derived_value_heavy",
  "boolean_expression_constant_heavy",
  "action_guard_heavy",
  "function_expression_constant_heavy",
  "view_model_pressure",

  "import_heavy",
  "external_import_heavy",
  "local_import_heavy",
  "deep_relative_import_heavy",
  "wide_named_import_heavy",
  "import_responsibility_spread",
  "ui_imports_data_access",
  "ui_imports_domain_logic",
  "production_imports_test_support",

  "export_heavy",
  "named_export_heavy",
  "default_export_present",
  "reexport_heavy",
  "star_reexport_present",
  "barrel_file",
  "public_api_pressure",
  "export_responsibility_spread",
  "mixed_export_roles",
  "utility_grab_bag",
  "type_export_heavy",
]);

export default function AiPromptPanel({
  filename,
  code,
  signals = [],
  risks = [],
  findings = [],
  repetition,
  selectedProjectFile,
  tatReview,
  analysisScopes = ["full"],
}) {
  const highImpactSignals = signals.filter((signal) =>
    HIGH_IMPACT_SIGNALS.has(signal),
  );

  const defaultConfig = useMemo(
    () =>
      buildPromptConfigFromAnalysis({
        filename,
        signals: highImpactSignals,
        risks,
        findings,
        repetition,
        tatReview,
        analysisScopes,
      }),
    [filename, highImpactSignals, risks, findings, repetition, tatReview, analysisScopes],
  );

  const [config, setConfig] = useState(defaultConfig);

  const hasRisks = risks.length > 0;
  const hasHighImpactSignals = highImpactSignals.length > 0;
  const hasStructuralRepetition =
    (repetition?.structuralRepetitions?.length ?? 0) > 0;
  const hasFindings = findings.length > 0;
  const hasSemanticContext = hasPromptSemanticContext(tatReview);

  if (
    !hasRisks &&
    !hasHighImpactSignals &&
    !hasStructuralRepetition &&
    !hasFindings &&
    !hasSemanticContext
  ) {
    return null;
  }

  const prompt = buildPrompt({
    filename,
    code,
    signals: highImpactSignals,
    risks,
    findings,
    repetition,
    config,
    selectedProjectFile,
    tatReview,
    analysisScopes,
  });

  function handleCopy() {
    navigator.clipboard.writeText(prompt);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>AI Prompt</h2>
          <p className="muted">
            SCREEN now builds this prompt from file role, cohesion, urgency,
            confidence, and safest extraction order.
          </p>
        </div>

        <button onClick={handleCopy}>Copy</button>
      </div>

      <PromptIntelligenceSummary
        tatReview={tatReview}
        analysisScopes={analysisScopes}
      />

      <PromptConfigPanel config={config} onChange={setConfig} />

      <pre className="ai-prompt">{prompt}</pre>
    </section>
  );
}

function PromptIntelligenceSummary({ tatReview = {}, analysisScopes = ["full"] }) {
  const fileRoles = tatReview.fileRoles ?? [];
  const domainCohesion = tatReview.domainCohesion ?? "unknown";
  const refactorUrgency = tatReview.refactorUrgency ?? "none";
  const extractionSteps = tatReview.extractionSteps ?? [];
  const signalConfidence = tatReview.signalConfidence ?? {};
  const confidenceEntries = Object.entries(signalConfidence);

  return (
    <div className="prompt-intelligence-summary">
      <PromptIntelligenceGroup
        title="Selected scopes"
        items={analysisScopes}
      />

      <PromptIntelligenceGroup
        title="File role"
        items={fileRoles.length ? fileRoles : ["unknown_file_role"]}
      />

      <PromptIntelligenceGroup
        title="Cohesion"
        items={[domainCohesion]}
      />

      <PromptIntelligenceGroup
        title="Urgency"
        items={[refactorUrgency]}
      />

      <PromptIntelligenceGroup
        title="Safest first move"
        items={extractionSteps.slice(0, 2)}
        emptyText="No extraction recommended"
      />

      <div className="prompt-intelligence-card">
        <span>Signal trust</span>
        {confidenceEntries.length ? (
          <div className="prompt-intelligence-chip-list">
            {confidenceEntries.map(([signal, details]) => (
              <span
                className={`scope-pill confidence-pill ${details?.level ?? "low"}`}
                key={signal}
              >
                {formatReviewLabel(signal)}:{" "}
                {formatReviewLabel(details?.level ?? "low")}
              </span>
            ))}
          </div>
        ) : (
          <strong>No evidence-backed boundary warnings</strong>
        )}
      </div>
    </div>
  );
}

function PromptIntelligenceGroup({ title, items = [], emptyText = "None" }) {
  const visibleItems = items.filter(Boolean);

  return (
    <div className="prompt-intelligence-card">
      <span>{title}</span>

      {visibleItems.length ? (
        <div className="prompt-intelligence-chip-list">
          {visibleItems.map((item) => (
            <span className="scope-pill subtle" key={item}>
              {formatReviewLabel(item)}
            </span>
          ))}
        </div>
      ) : (
        <strong>{emptyText}</strong>
      )}
    </div>
  );
}

function hasPromptSemanticContext(tatReview = {}) {
  return Boolean(
    (tatReview.fileRoles ?? []).length ||
      tatReview.domainCohesion ||
      tatReview.refactorUrgency ||
      (tatReview.extractionSteps ?? []).length ||
      Object.keys(tatReview.signalConfidence ?? {}).length,
  );
}