import { formatFindingRule } from "../utils/formatters";


function getReviewLabel(findings) {
  if (findings.some((finding) => finding.severity === "error")) {
    return "🔴 Risky Change";
  }

  if (findings.some((finding) => finding.severity === "warning")) {
    return "🟠 Needs Refactor";
  }

  if (findings.some((finding) => finding.severity === "caution")) {
    return "🟡 Caution";
  }

  return "✅ Healthy";
}

function getReviewLabelClass(findings) {
  if (findings.some((finding) => finding.severity === "error")) {
    return "risky";
  }

  if (findings.some((finding) => finding.severity === "warning")) {
    return "warning";
  }

  if (findings.some((finding) => finding.severity === "caution")) {
    return "caution";
  }

  return "healthy";
}

export default function FindingReview({ findings = [] }) {
  const label = getReviewLabel(findings);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Review Findings</h2>
          <p className="muted">TAT-generated actionable review checklist.</p>
        </div>

        <div className={`review-label ${getReviewLabelClass(findings)}`}>
          {label}
        </div>
      </div>

      {findings.length === 0 ? (
        <p className="muted">No actionable findings detected.</p>
      ) : (
        <div className="finding-list">
          {findings.map((finding) => (
            <article className="finding-card" key={finding.id}>
              <div className="finding-header">
                <span className={`finding-severity ${finding.severity}`}>
                  {finding.severity}
                </span>
                <span className="finding-rule">
                  {formatFindingRule(finding.rule)}
                </span>{" "}
              </div>

              <h3>{finding.message}</h3>

              <dl className="finding-details">
                <div>
                  <dt>Why</dt>
                  <dd>{finding.whyItMatters}</dd>
                </div>

                <div>
                  <dt>Suggested fix</dt>
                  <dd>{finding.suggestedFix}</dd>
                </div>

                <div>
                  <dt>Next action</dt>
                  <dd>{finding.nextAction}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
