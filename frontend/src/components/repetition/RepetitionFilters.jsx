import { formatReviewLabel } from "../../utils/formatters";

const SEVERITIES = ["high", "medium", "low"];

export default function RepetitionFilters({
  visibleSeverities,
  onToggleSeverity,
}) {
  return (
    <div className="severity-filter">
      {SEVERITIES.map((severity) => (
        <label key={severity} className="severity-toggle">
          <input
            type="checkbox"
            checked={visibleSeverities.includes(severity)}
            onChange={() => onToggleSeverity(severity)}
          />

          {formatReviewLabel(severity)}
        </label>
      ))}
    </div>
  );
}