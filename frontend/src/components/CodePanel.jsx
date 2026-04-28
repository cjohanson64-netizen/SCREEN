import { useEffect, useMemo, useState } from "react";

import CodeEditor from "./CodeEditor";
import ResultsTabs from "./ResultsTabs";
import { buildResultsTabs } from "../utils/buildResultsTabs";

const ANALYZE_API_URL = "http://localhost:5050/api/analyze";

export default function CodePanel({
  selectedProjectFile,
  onBackToHealthGraph,
}) {
  const [filename, setFilename] = useState(selectedProjectFile?.path || "");
  const [code, setCode] = useState(selectedProjectFile?.content || "");

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);
  const [highlightedLines, setHighlightedLines] = useState([]);

  const resultTabs = useMemo(() => {
    if (!result) return [];

    return buildResultsTabs({
      result,
      code,
      filename,
      selectedProjectFile,
      highlightedLines,
      onHighlightLines: setHighlightedLines,
    });
  }, [result, code, selectedProjectFile, filename, highlightedLines]);

  useEffect(() => {
    if (!selectedProjectFile?.content) return;

    let cancelled = false;

    async function analyzeSelectedFile() {
      await Promise.resolve();

      if (cancelled) return;
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(ANALYZE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: selectedProjectFile.path || "",
            code: selectedProjectFile.content || "",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze code.");
        }

        if (cancelled) return;
        setResult(data);
        setHighlightedLines([]);
        setIsAnalyzed(true);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to analyze code.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    analyzeSelectedFile();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectFile]);

  return (
    <main className="app-shell">
      <button
        type="button"
        className="back-to-dashboard-button"
        onClick={onBackToHealthGraph}
      >
        ← Back to Health Graph
      </button>

      {selectedProjectFile && (
        <section className="project-file-banner">
          <h2>Selected Project File</h2>
          <p className="project-file-path">{selectedProjectFile.path}</p>
          <p className="project-file-meta">
            Risk: {selectedProjectFile.metrics?.riskLevel ?? "unknown"} ·
            Complexity: {selectedProjectFile.metrics?.complexity ?? 0}
          </p>
        </section>
      )}

      {error && (
        <section className="panel">
          <p className="error-message">{error}</p>
        </section>
      )}

      <div className="main-grid">
        <CodeEditor
          filename={filename}
          code={code}
          isAnalyzed={isAnalyzed}
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
                Analysis will appear here automatically for the selected file.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
