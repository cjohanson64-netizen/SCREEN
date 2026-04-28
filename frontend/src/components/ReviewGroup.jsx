import { REVIEW_EXPLANATIONS } from "../constants/reviewExplanations";
import { formatReviewLabel } from "../utils/formatters";

export default function ReviewGroup({
  title,
  items = [],
  emptyText,
  type,
  signals = [],
  renderActions,
}) {
  return (
    <div className="review-group">
      <h3>{title}</h3>

      {items.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div className="review-card-list">
          {items.map((item) => (
            <div className={`review-card ${type}`} key={item}>
              <div className="review-card-header">
                <strong>{formatReviewLabel(item)}</strong>
                {renderActions && renderActions(item)}
              </div>

              {renderExplanationList(item, signals)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderExplanationList(item, signals = []) {
  if (item !== "needs_refactor") {
    return (
      <ul className="reason-list">
        <li>
          {REVIEW_EXPLANATIONS[item] ?? "TAT flagged this as worth reviewing."}
        </li>
      </ul>
    );
  }

  const causes = signals.filter((signal) => signal !== "needs_refactor");

  return (
    <ul className="reason-list">
      <div className="reason-intro">
        This file is high risk because it triggered:
      </div>

      {causes.map((cause) => (
        <li key={cause}>{formatReviewLabel(cause)}</li>
      ))}
    </ul>
  );
}