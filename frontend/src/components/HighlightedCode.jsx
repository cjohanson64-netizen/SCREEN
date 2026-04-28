export default function HighlightedCode({ code, highlightedLines = [] }) {
  const highlightedSet = new Set(highlightedLines);
  const lines = code.split("\n");

  return (
    <div className="highlighted-code">
      <div className="highlighted-code-header">
        <span>Code Map</span>
        <span>{highlightedLines.length} highlighted lines</span>
      </div>

      <pre>
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isHighlighted = highlightedSet.has(lineNumber);

          return (
            <div
              key={lineNumber}
              className={`code-line ${isHighlighted ? "highlighted" : ""}`}
            >
              <span className="line-number">{lineNumber}</span>
              <code>{line || " "}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}