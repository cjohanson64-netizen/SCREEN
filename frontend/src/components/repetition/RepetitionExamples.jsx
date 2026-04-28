export default function RepetitionExamples({
  examples = [],
}) {
  if (!examples.length) {
    return null;
  }

  return (
    <div className="examples">
      <h4>Examples</h4>

      {examples.map((example) => (
        <div
          className="example-line"
          key={example.lineNumber}
        >
          <span>Line {example.lineNumber}</span>

          <code>{example.line}</code>
        </div>
      ))}
    </div>
  );
}