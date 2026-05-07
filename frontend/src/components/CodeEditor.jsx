import HighlightedCode from "./HighlightedCode";

export default function CodeEditor({
  filename,
  code,
  isAnalyzed,
  highlightedLines = [],
  onFilenameChange,
  onCodeChange,
}) {
  return (
    <section className="panel editor-panel">
      <div className="field">
        <label>Filename</label>
        <input
          value={filename}
          disabled={isAnalyzed}
          onChange={(e) => onFilenameChange(e.target.value)}
          placeholder="fileName.js"
        />
      </div>

      <div className="field">
        <label>{isAnalyzed ? "Code Preview" : "Code"}</label>

        {isAnalyzed ? (
          <HighlightedCode code={code} highlightedLines={highlightedLines} />
        ) : (
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck="false"
            placeholder="function myFunction(param) { ... }"
          />
        )}
      </div>
    </section>
  );
}