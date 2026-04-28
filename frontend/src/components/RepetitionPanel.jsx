import { useState } from "react";

import RepetitionFilters from "./repetition/RepetitionFilters";
import RepetitionList from "./repetition/RepetitionList";

export default function RepetitionPanel({
  repetition,
  highlightedLines = [],
  onHighlightLines,
}) {
  const [visibleSeverities, setVisibleSeverities] = useState([
    "high",
    "medium",
  ]);

  const meaningfulItems = repetition?.meaningfulRepetitions ?? [];

  const visibleItems = meaningfulItems.filter((item) =>
    visibleSeverities.includes(item.severity),
  );

  function toggleSeverity(severity) {
    setVisibleSeverities((current) =>
      current.includes(severity)
        ? current.filter((item) => item !== severity)
        : [...current, severity],
    );
  }

  if (!meaningfulItems.length) {
    return (
      <section className="panel">
        <h2>Repeated Code</h2>
        <p className="muted">No repeated code patterns detected.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Repeated Code</h2>

          <p className="muted">
            These are repeated or similarly shaped lines that may be worth
            extracting, simplifying, or reviewing.
          </p>
        </div>

        <RepetitionFilters
          visibleSeverities={visibleSeverities}
          onToggleSeverity={toggleSeverity}
        />
      </div>

      {!visibleItems.length ? (
        <p className="muted">
          No repeated patterns match the selected severity filters.
        </p>
      ) : (
        <RepetitionList
          items={visibleItems}
          highlightedLines={highlightedLines}
          onHighlightLines={onHighlightLines}
        />
      )}
    </section>
  );
}