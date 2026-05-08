const ANALYSIS_SCOPES = [
  {
    id: "structure",
    label: "Structure",
    description: "File size, token pressure, blocks, nesting, and long lines.",
  },
  {
    id: "functions",
    label: "Functions",
    description: "Function roles such as hooks, handlers, analyzers, getters, and components.",
  },
  {
    id: "constants",
    label: "Constants",
    description: "Flags, thresholds, boolean rules, action guards, and view-model pressure.",
  },
  {
    id: "imports",
    label: "Imports",
    description: "Import volume, dependency spread, UI/data coupling, and boundary signals.",
  },
  {
    id: "exports",
    label: "Exports",
    description: "Public API surface, barrel files, reexports, and utility grab-bag pressure.",
  },
  {
    id: "loops",
    label: "Loops",
    description: "Loop density signals. This scope is intentionally small for now.",
  },
  {
    id: "complexity",
    label: "Complexity",
    description: "Repetition, branching, boolean density, decisions, and error-handling pressure.",
  },
  {
    id: "risk",
    label: "Risk",
    description: "Final extension-risk escalation signals.",
  },
];

const DEFAULT_ANALYSIS_SCOPES = ["full"];

export default function AnalysisOptions({
  filename,
  selectedScopes,
  isAnalyzing,
  hasResult,
  onScopesChange,
  onAnalyze,
}) {
  const selectedScopeIds = Array.isArray(selectedScopes)
    ? selectedScopes
    : DEFAULT_ANALYSIS_SCOPES;
  const isFullReview = selectedScopeIds.includes("full");
  const canAnalyze = isFullReview || selectedScopeIds.length > 0;

  function toggleFullReview() {
    onScopesChange(isFullReview ? [] : ["full"]);
  }

  function toggleScope(scopeId) {
    const withoutFull = selectedScopeIds.filter((scope) => scope !== "full");
    const nextScopes = withoutFull.includes(scopeId)
      ? withoutFull.filter((scope) => scope !== scopeId)
      : [...withoutFull, scopeId];

    onScopesChange(nextScopes);
  }

  return (
    <section className="panel analysis-options-panel">
      <div className="analysis-options-header">
        <div>
          <p className="eyebrow">Analysis Options</p>
          <h2>Choose SCREEN's semantic lens</h2>
          <p className="muted">
            Select what you want SCREEN to analyze, then run the review when
            you are ready.
          </p>
        </div>

        {filename ? (
          <div className="analysis-selected-file">
            <span>Selected file</span>
            <strong>{filename}</strong>
          </div>
        ) : null}
      </div>

      <label className={`analysis-option full ${isFullReview ? "selected" : ""}`}>
        <input
          type="checkbox"
          checked={isFullReview}
          disabled={isAnalyzing}
          onChange={toggleFullReview}
        />
        <span>
          <strong>Full Review</strong>
          <small>Run every SCREEN review domain.</small>
        </span>
      </label>

      <div className="analysis-options-grid" aria-disabled={isFullReview}>
        {ANALYSIS_SCOPES.map((scope) => {
          const isSelected = !isFullReview && selectedScopeIds.includes(scope.id);

          return (
            <label
              className={`analysis-option ${isSelected ? "selected" : ""} ${
                isFullReview ? "disabled" : ""
              }`}
              key={scope.id}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isFullReview || isAnalyzing}
                onChange={() => toggleScope(scope.id)}
              />
              <span>
                <strong>{scope.label}</strong>
                <small>{scope.description}</small>
              </span>
            </label>
          );
        })}
      </div>

      <div className="analysis-options-actions">
        <button
          type="button"
          className="analyze-selected-button"
          disabled={!canAnalyze || isAnalyzing}
          onClick={onAnalyze}
        >
          {isAnalyzing ? "Analyzing..." : hasResult ? "Run analysis again" : "Analyze selected file"}
        </button>

        <p className="muted analysis-options-help">
          V1 runs the review safely and displays only the selected semantic
          domains. Once selective TAT composition is fully wired, these options
          can run only the selected graphs.
        </p>
      </div>
    </section>
  );
}
