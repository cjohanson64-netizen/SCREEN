import { useMemo, useState } from "react";
import { buildPrompt } from "../utils/buildPrompt";
import { buildPromptConfigFromAnalysis } from "../utils/promptConfig";
import PromptConfigPanel from "./PromptConfigPanel";

const HIGH_IMPACT_SIGNALS = new Set([
  "long_file",
  "high_token_count",
  "many_functions",
  "deep_nesting",
  "high_complexity",
  "many_decisions",
  "loop_heavy",
  "boolean_dense",
  "error_handling_heavy",
]);

export default function AiPromptPanel({
  filename,
  code,
  signals = [],
  risks = [],
  findings = [],
  repetition,
  selectedProjectFile
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
    selectedProjectFile
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