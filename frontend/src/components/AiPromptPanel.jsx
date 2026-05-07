import { useMemo, useState } from "react";
import { buildPrompt } from "../utils/buildPrompt";
import { buildPromptConfigFromAnalysis } from "../utils/promptConfig";
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
      }),
    [filename, highImpactSignals, risks, findings, repetition],
  );

  const [config, setConfig] = useState(defaultConfig);

  const hasRisks = risks.length > 0;
  const hasHighImpactSignals = highImpactSignals.length > 0;
  const hasStructuralRepetition =
    (repetition?.structuralRepetitions?.length ?? 0) > 0;
  const hasFindings = findings.length > 0;

  if (
    !hasRisks &&
    !hasHighImpactSignals &&
    !hasStructuralRepetition &&
    !hasFindings
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
            Configure the task, target architecture, strictness, and output
            format.
          </p>
        </div>

        <button onClick={handleCopy}>Copy</button>
      </div>

      <PromptConfigPanel config={config} onChange={setConfig} />

      <pre className="ai-prompt">{prompt}</pre>
    </section>
  );
}
