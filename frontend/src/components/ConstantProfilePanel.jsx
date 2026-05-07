import { useState } from "react";
import { formatReviewLabel } from "../utils/formatters";

function formatTopCounts(items = []) {
  if (!items.length) return "None detected";

  return items.map((item) => `${item.name}: ${item.count}`).join(", ");
}

function getConstantAdvice(constantProfile = {}) {
  const categoryCounts = constantProfile.categoryCounts ?? {};
  const advice = [];

  if ((constantProfile.booleanLikeCount ?? 0) >= 8) {
    advice.push({
      title: "Boolean rule grouping",
      detail:
        "Group related isX, hasX, canX, and shouldX constants into predicate helpers, guard helpers, or a focused rule module.",
    });
  }

  if ((constantProfile.thresholdLikeCount ?? 0) >= 4) {
    advice.push({
      title: "Threshold/config extraction",
      detail:
        "Move MAX, MIN, DEFAULT, THRESHOLD, LIMIT, and timing constants into a constants, config, or scoring-rules module.",
    });
  }

  if ((constantProfile.flagLikeCount ?? 0) >= 6) {
    advice.push({
      title: "Flag/state grouping",
      detail:
        "Group related UI and state flags by the screen region or state domain they control.",
    });
  }

  if ((constantProfile.decisionRuleLikeCount ?? 0) >= 5) {
    advice.push({
      title: "Decision rule extraction",
      detail:
        "Move decision-rule constants into named rules so policy, permissions, and requirements are easier to audit.",
    });
  }

  if ((categoryCounts.visibilityFlags ?? 0) >= 3) {
    advice.push({
      title: "Visibility rule extraction",
      detail:
        "Group showX, hideX, and visibleX constants into view-state helpers or display rules.",
    });
  }

  if ((constantProfile.renderDataProjectionCount ?? 0) >= 4) {
    advice.push({
      title: "Render data projection",
      detail:
        "Several constants prepare values for rendering. That can be healthy, but if it grows, consider a selector, view-model helper, or custom hook.",
    });
  }

  if ((constantProfile.actionGuardCandidateCount ?? 0) >= 3) {
    advice.push({
      title: "Action guard extraction",
      detail:
        "Several constants appear to control whether actions are allowed or disabled. Group related guards into predicate helpers.",
    });
  }

  if ((constantProfile.functionExpressionCount ?? 0) >= 3) {
    advice.push({
      title: "Const function review",
      detail:
        "Several const declarations store functions. SCREEN treats these as function-shaped values, not ordinary constants.",
    });
  }

  return advice;
}

function NameList({ title, names = [] }) {
  if (!names.length) return null;

  return (
    <div className="constant-name-group">
      <h4>{title}</h4>
      <div className="constant-chip-list">
        {names.slice(0, 14).map((name) => (
          <span className="constant-chip" key={name}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function SemanticRoleTable({ semanticRoles = [] }) {
  if (!semanticRoles.length) return null;

  return (
    <div className="constant-role-table-wrap">
      <h4>Semantic role samples</h4>

      <div className="constant-role-table">
        <div className="constant-role-row constant-role-head">
          <span>Name</span>
          <span>Value kind</span>
          <span>Role</span>
        </div>

        {semanticRoles.slice(0, 12).map((item) => (
          <div className="constant-role-row" key={item.name}>
            <span>{item.name}</span>
            <span>{formatReviewLabel(item.valueSemantic?.kind ?? "unknown")}</span>
            <span>{formatReviewLabel(item.combinedRole ?? "unknown")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConstantProfilePanel({ constantProfile = {} }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!constantProfile || Object.keys(constantProfile).length === 0) {
    return (
      <section className="constant-profile-panel">
        <h3>Constant Profile</h3>
        <p className="muted">
          No semantic constant profile is available for this file yet.
        </p>
      </section>
    );
  }

  const categoryCounts = constantProfile.categoryCounts ?? {};
  const advice = getConstantAdvice(constantProfile);

  return (
    <section className="constant-profile-panel">
      <button
        className="profile-collapse-header"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div>
          <h3>Constant Profile</h3>
          <p className="muted">
            SCREEN classifies constants by name, value shape, usage, and
            combined semantic role.
          </p>
        </div>

        <div className="profile-header-actions">
          <span className="constant-profile-badge">
            {constantProfile.dominantRole
              ? formatReviewLabel(constantProfile.dominantRole)
              : constantProfile.dominantCategory
                ? formatReviewLabel(constantProfile.dominantCategory)
                : "No dominant role"}
          </span>
          <span className="profile-collapse-icon" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="constant-profile-grid">
            <div className="constant-profile-stat">
              <span>Total named</span>
              <strong>{constantProfile.namedCount ?? constantProfile.total ?? 0}</strong>
            </div>

            <div className="constant-profile-stat">
              <span>Boolean-like</span>
              <strong>{constantProfile.booleanLikeCount ?? 0}</strong>
            </div>

            <div className="constant-profile-stat">
              <span>Thresholds</span>
              <strong>{constantProfile.thresholdLikeCount ?? 0}</strong>
            </div>

            <div className="constant-profile-stat">
              <span>Render projection</span>
              <strong>{constantProfile.renderDataProjectionCount ?? 0}</strong>
            </div>

            <div className="constant-profile-stat">
              <span>Action guards</span>
              <strong>{constantProfile.actionGuardCandidateCount ?? 0}</strong>
            </div>

            <div className="constant-profile-stat">
              <span>Const functions</span>
              <strong>{constantProfile.functionExpressionCount ?? 0}</strong>
            </div>
          </div>

          <div className="constant-profile-detail-grid">
            <div className="constant-profile-detail-card">
              <h4>Top prefixes</h4>
              <p>{formatTopCounts(constantProfile.topPrefixes)}</p>
            </div>

            <div className="constant-profile-detail-card">
              <h4>Top roles</h4>
              <p>{formatTopCounts(constantProfile.topRoles)}</p>
            </div>

            <div className="constant-profile-detail-card">
              <h4>Top value kinds</h4>
              <p>{formatTopCounts(constantProfile.topValueKinds)}</p>
            </div>

            <div className="constant-profile-detail-card">
              <h4>Name semantics</h4>
              <ul className="compact-list">
                <li>Predicates: {categoryCounts.predicates ?? 0}</li>
                <li>Capabilities: {categoryCounts.capabilities ?? 0}</li>
                <li>Requirements: {categoryCounts.requirementRules ?? 0}</li>
                <li>Feature flags: {categoryCounts.featureFlags ?? 0}</li>
                <li>Visibility flags: {categoryCounts.visibilityFlags ?? 0}</li>
                <li>State flags: {categoryCounts.stateFlags ?? 0}</li>
              </ul>
            </div>

            <div className="constant-profile-detail-card">
              <h4>Value roles</h4>
              <ul className="compact-list">
                <li>Entity aliases: {constantProfile.entityAliasCount ?? 0}</li>
                <li>
                  Collection aliases: {constantProfile.collectionAliasCount ?? 0}
                </li>
                <li>Derived values: {constantProfile.derivedValueCount ?? 0}</li>
                <li>
                  Numeric derived: {constantProfile.derivedNumericValueCount ?? 0}
                </li>
                <li>
                  Boolean derived: {constantProfile.booleanDerivedValueCount ?? 0}
                </li>
                <li>
                  Function expressions: {constantProfile.functionExpressionCount ?? 0}
                </li>
              </ul>
            </div>
          </div>

          {advice.length > 0 && (
            <div className="constant-advice-list">
              <h4>Why this matters</h4>

              {advice.map((item) => (
                <article className="constant-advice-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          )}

          <div className="constant-name-lists">
            <NameList
              title="Boolean / rule-shaped constants"
              names={constantProfile.booleanLikeNames}
            />

            <NameList
              title="Threshold / config constants"
              names={constantProfile.thresholdNames}
            />

            <NameList
              title="Render data projection"
              names={constantProfile.renderDataProjectionNames}
            />

            <NameList
              title="Entity aliases"
              names={constantProfile.entityAliasNames}
            />

            <NameList
              title="Collection aliases"
              names={constantProfile.collectionAliasNames}
            />

            <NameList
              title="Derived values"
              names={constantProfile.derivedValueNames}
            />

            <NameList
              title="Action guard candidates"
              names={constantProfile.actionGuardCandidateNames}
            />

            <NameList
              title="Const function expressions"
              names={constantProfile.functionExpressionNames}
            />
          </div>

          <SemanticRoleTable semanticRoles={constantProfile.semanticRoles} />
        </>
      )}
    </section>
  );
}