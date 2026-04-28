export default function MetricCards({ metrics }) {
  const cards = [
    ["Lines", metrics.lineCount],
    ["Tokens", metrics.tokenEstimate],
    ["Functions", metrics.functionCount],
    ["Blocks", metrics.blockCount],
    ["Max Nesting", metrics.maxNestingDepth],
    ["Complexity", metrics.complexity?.complexityScore ?? 0],
    ["Repetition", metrics.repetition?.repetitionScore ?? 0],
  ];

  return (
    <section className="panel">
      <h2>Metrics</h2>
      <div className="metric-grid">
        {cards.map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}