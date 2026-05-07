import { useState } from "react";
import { formatReviewLabel } from "../utils/formatters";

function formatTopCounts(items = []) {
  if (!items.length) return "None detected";

  return items.map((item) => `${item.name}: ${item.count}`).join(", ");
}

function getExtractionAdvice(functionProfile = {}) {
  const categoryCounts = functionProfile.categoryCounts ?? {};
  const advice = [];

  if ((functionProfile.hookCount ?? 0) >= 4) {
    advice.push({
      title: "Hook extraction",
      detail:
        "Move related useX functions into a hooks folder or focused custom-hook module.",
    });
  }

  if ((functionProfile.componentCount ?? 0) >= 4) {
    advice.push({
      title: "Component extraction",
      detail:
        "Move secondary PascalCase components into component files or a local components folder.",
    });
  }

  if ((categoryCounts.analyzers ?? 0) >= 3) {
    advice.push({
      title: "Analyzer module extraction",
      detail:
        "Group analyzeX and detectX functions into a dedicated analyzer module.",
    });
  }

  if ((categoryCounts.predicates ?? 0) >= 4) {
    advice.push({
      title: "Rule or guard extraction",
      detail:
        "Move hasX, isX, canX, and shouldX functions into named rule or guard helpers.",
    });
  }

  if ((categoryCounts.handlers ?? 0) >= 4) {
    advice.push({
      title: "Interaction handler extraction",
      detail:
        "Separate handleX and toggleX behavior from rendering or data logic.",
    });
  }

  if ((categoryCounts.getters ?? 0) >= 4) {
    advice.push({
      title: "Selector extraction",
      detail:
        "Group getX functions into selectors, query helpers, or data-access utilities.",
    });
  }

  return advice;
}

function FunctionNameList({ title, names = [] }) {
  if (!names.length) return null;

  return (
    <div className="function-name-group">
      <h4>{title}</h4>
      <div className="function-chip-list">
        {names.slice(0, 12).map((name) => (
          <span className="function-chip" key={name}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FunctionProfilePanel({ functionProfile = {} }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!functionProfile || Object.keys(functionProfile).length === 0) {
    return (
      <section className="function-profile-panel">
        <h3>Function Profile</h3>
        <p className="muted">
          No semantic function profile is available for this file yet.
        </p>
      </section>
    );
  }

  const categoryCounts = functionProfile.categoryCounts ?? {};
  const advice = getExtractionAdvice(functionProfile);

  return (
    <section className="function-profile-panel">
      <button
        className="profile-collapse-header"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div>
          <h3>Function Profile</h3>
          <p className="muted">
            SCREEN classifies function names so TAT can explain what kind of
            complexity is present.
          </p>
        </div>

        <div className="profile-header-actions">
          <span className="function-profile-badge">
            {functionProfile.dominantCategory
              ? formatReviewLabel(functionProfile.dominantCategory)
              : "No dominant category"}
          </span>
          <span className="profile-collapse-icon" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="function-profile-grid">
            <div className="function-profile-stat">
              <span>Total named</span>
              <strong>{functionProfile.namedCount ?? functionProfile.total ?? 0}</strong>
            </div>

            <div className="function-profile-stat">
              <span>Hooks</span>
              <strong>{functionProfile.hookCount ?? 0}</strong>
            </div>

            <div className="function-profile-stat">
              <span>Components</span>
              <strong>{functionProfile.componentCount ?? 0}</strong>
            </div>

            <div className="function-profile-stat">
              <span>Anonymous</span>
              <strong>{functionProfile.anonymousCount ?? 0}</strong>
            </div>
          </div>

          <div className="function-profile-detail-grid">
            <div className="function-profile-detail-card">
              <h4>Top verbs</h4>
              <p>{formatTopCounts(functionProfile.topVerbs)}</p>
            </div>

            <div className="function-profile-detail-card">
              <h4>Top categories</h4>
              <p>{formatTopCounts(functionProfile.topCategories)}</p>
            </div>

            <div className="function-profile-detail-card">
              <h4>Semantic counts</h4>
              <ul className="compact-list">
                <li>Getters: {categoryCounts.getters ?? 0}</li>
                <li>Predicates: {categoryCounts.predicates ?? 0}</li>
                <li>Analyzers: {categoryCounts.analyzers ?? 0}</li>
                <li>Handlers: {categoryCounts.handlers ?? 0}</li>
                <li>Builders: {categoryCounts.builders ?? 0}</li>
                <li>Transformers: {categoryCounts.transformers ?? 0}</li>
              </ul>
            </div>
          </div>

          {advice.length > 0 && (
            <div className="function-advice-list">
              <h4>Why this matters</h4>

              {advice.map((item) => (
                <article className="function-advice-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          )}

          <div className="function-name-lists">
            <FunctionNameList
              title="Hook-shaped functions"
              names={functionProfile.hookNames}
            />
            <FunctionNameList
              title="Component-shaped functions"
              names={functionProfile.componentNames}
            />
          </div>
        </>
      )}
    </section>
  );
}