import { formatReviewLabel } from "../../utils/formatters";

import RepetitionExamples from "./RepetitionExamples";

import {
  haveSameLines,
  toggleHighlightedLocations,
} from "../../utils/RepetitionUtils";

export default function RepetitionCard({
  item,
  highlightedLines,
  onHighlightLines,
}) {
  const locations = item.locations ?? [];

  const isSelected =
    locations.length > 0 &&
    haveSameLines(locations, highlightedLines);

  function handleHighlightClick() {
    if (!onHighlightLines) {
      return;
    }

    onHighlightLines(
      toggleHighlightedLocations({
        isSelected,
        locations,
      }),
    );
  }

  return (
    <div className="repetition-card">
      <div className="repetition-header">
        <strong>{item.count} occurrences</strong>

        <span>{formatReviewLabel(item.classification)}</span>

        <span className={`severity ${item.severity}`}>
          {item.severity}
        </span>

        {onHighlightLines && (
          <button
            className={`small-button highlight-lines-button ${
              isSelected ? "selected" : ""
            }`}
            onClick={handleHighlightClick}
          >
            Highlight lines
          </button>
        )}
      </div>

      <pre>{item.pattern}</pre>

      <RepetitionExamples examples={item.examples} />
    </div>
  );
}