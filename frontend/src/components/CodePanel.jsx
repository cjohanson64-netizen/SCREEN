import { useMemo, useState } from "react";

import CodeEditor from "./CodeEditor";
import ResultsTabs from "./ResultsTabs";
import AnalysisOptions from "./AnalysisOptions";
import { buildResultsTabs } from "../utils/buildResultsTabs";

const ANALYZE_API_URL = "http://localhost:5050/api/analyze";
const DEFAULT_ANALYSIS_SCOPES = ["functions", "constants", "imports"];

function normalizeAnalysisScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    return DEFAULT_ANALYSIS_SCOPES;
  }

  return scopes;
}

export default function CodePanel({
  selectedProjectFile,
  onBackToHealthGraph,
}) {
  const [filename, setFilename] = useState(selectedProjectFile?.path || "");
  const [code, setCode] = useState(selectedProjectFile?.content || "");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);
  const [highlightedLines, setHighlightedLines] = useState([]);
  const [selectedAnalysisScopes, setSelectedAnalysisScopes] = useState(
    DEFAULT_ANALYSIS_SCOPES,
  );

  const isProjectFileMode = Boolean(selectedProjectFile);

  const resultTabs = useMemo(() => {
    if (!result) return [];

    return buildResultsTabs({
      result,
      code,
      filename,
      selectedProjectFile,
      highlightedLines,
      onHighlightLines: setHighlightedLines,
      analysisScopes: result?.analysisScopes ?? result?.tatReview?.analysisScopes ?? selectedAnalysisScopes,
    });
  }, [
    result,
    code,
    selectedProjectFile,
    filename,
    highlightedLines,
    selectedAnalysisScopes,
  ]);

  async function handleAnalyzeSelectedFile() {
    const normalizedScopes = normalizeAnalysisScopes(selectedAnalysisScopes);

    if (!code.trim()) {
      setError("No code provided");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(ANALYZE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
          code,
          analysisScopes: normalizedScopes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze code.");
      }

      setResult(data);
      setHighlightedLines([]);
    } catch (err) {
      setError(err.message || "Failed to analyze code.");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <main className="app-shell">
      <button
        type="button"
        className="back-to-dashboard-button"
        onClick={onBackToHealthGraph}
      >
        ← Back to Health Graph
      </button>

      {error && (
        <section className="panel">
          <p className="error-message">{error}</p>
        </section>
      )}

      <AnalysisOptions
        filename={filename}
        selectedScopes={selectedAnalysisScopes}
        isAnalyzing={isLoading}
        hasResult={Boolean(result)}
        onScopesChange={(nextScopes) => {
          setSelectedAnalysisScopes(nextScopes);
          setResult(null);
          setHighlightedLines([]);
        }}
        onAnalyze={handleAnalyzeSelectedFile}
      />

      <div className="main-grid">
        <CodeEditor
          filename={filename}
          code={code}
          isAnalyzed={isProjectFileMode || Boolean(result)}
          highlightedLines={highlightedLines}
          onFilenameChange={setFilename}
          onCodeChange={setCode}
        />

        <div>
          {result ? (
            <ResultsTabs tabs={resultTabs} />
          ) : isLoading ? (
            <section className="panel">
              <h2>Analysis Results</h2>
              <p className="muted">Analyzing selected file...</p>
            </section>
          ) : (
            <section className="panel">
              <h2>Analysis Results</h2>
              <p className="muted">
                Choose analysis options, then click Analyze selected file.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
