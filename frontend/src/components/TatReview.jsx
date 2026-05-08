import ReviewGroup from "./ReviewGroup";
import { buildMiniPrompt } from "../utils/buildMiniPrompt";
import { formatReviewLabel } from "../utils/formatters";

const URGENCY_CLASS_BY_VALUE = {
  none: "subtle",
  watch: "watch",
  recommended: "recommended",
  urgent: "urgent",
};

const COHESION_CLASS_BY_VALUE = {
  cohesive: "cohesive",
  mixed: "mixed",
  ambiguous: "ambiguous",
  unknown: "unknown",
};

export default function TatReview({ review, code }) {
  const signals = review.signals ?? [];
  const risks = review.risks ?? [];
  const fileRoles = review.fileRoles ?? [];
  const expectedTraits = review.expectedTraits ?? {};
  const lowToleranceTraits = review.lowToleranceTraits ?? {};
  const refactorUrgency = review.refactorUrgency ?? "none";
  const refactorWorthinessSignals = review.refactorWorthinessSignals ?? [];
  const refactorRecommendations = review.refactorRecommendations ?? [];
  const refactorReasonMap = review.refactorReasonMap ?? {};
  const domainCohesion = review.domainCohesion ?? "unknown";
  const activeDomains = review.activeDomains ?? [];
  const domainSignals = review.domainSignals ?? [];
  const domainRecommendations = review.domainRecommendations ?? [];
  const domainReasonMap = review.domainReasonMap ?? {};
  const extractionSteps = review.extractionSteps ?? [];
  const extractionReasonMap = review.extractionReasonMap ?? {};
  const signalConfidence = review.signalConfidence ?? {};

  return (
    <section className="panel">
      <h2>Semantic Review</h2>

      <div className={review.success ? "status success" : "status failure"}>
        {review.success ? "Semantic review succeeded" : "TAT review failed"}
      </div>

      <FileContextSummary
        fileRoles={fileRoles}
        expectedTraits={expectedTraits}
        lowToleranceTraits={lowToleranceTraits}
      />

      <RefactorWorthinessSummary
        urgency={refactorUrgency}
        signals={refactorWorthinessSignals}
        recommendations={refactorRecommendations}
        reasonMap={refactorReasonMap}
      />

      <DomainCohesionSummary
        cohesion={domainCohesion}
        activeDomains={activeDomains}
        signals={domainSignals}
        recommendations={domainRecommendations}
        reasonMap={domainReasonMap}
      />

      <ExtractionOrderSummary
        steps={extractionSteps}
        reasonMap={extractionReasonMap}
      />

      <SignalTrustSummary signalConfidence={signalConfidence} />

      <div className="review-grid">
        <ReviewGroup
          title="Signals"
          emptyText="No signals triggered."
          items={signals}
          type="signal"
          renderActions={(signal) => (
            <button
              className="small-button"
              onClick={() => {
                const prompt = buildMiniPrompt(signal, { code });
                navigator.clipboard.writeText(prompt);
              }}
            >
              Copy AI Prompt
            </button>
          )}
        />

        <ReviewGroup
          title="Risks"
          emptyText="No risks detected."
          items={risks}
          type="risk"
          signals={signals}
        />
      </div>
    </section>
  );
}

function FileContextSummary({
  fileRoles = [],
  expectedTraits = {},
  lowToleranceTraits = {},
}) {
  if (!fileRoles.length) {
    return null;
  }

  return (
    <div className="file-context-summary">
      <h3>File Context</h3>

      <div className="file-context-role-list">
        {fileRoles.map((role) => (
          <span className="scope-pill" key={role}>
            {formatReviewLabel(role)}
          </span>
        ))}
      </div>

      <FileContextTraitList
        title="Expected in this file role"
        roles={fileRoles}
        traitMap={expectedTraits}
      />

      <FileContextTraitList
        title="Low-tolerance areas"
        roles={fileRoles}
        traitMap={lowToleranceTraits}
      />
    </div>
  );
}

function RefactorWorthinessSummary({
  urgency = "none",
  signals = [],
  recommendations = [],
  reasonMap = {},
}) {
  const hasWorthinessData =
    urgency !== "none" || signals.length > 0 || recommendations.length > 0;

  if (!hasWorthinessData) {
    return null;
  }

  const urgencyClass = URGENCY_CLASS_BY_VALUE[urgency] ?? "subtle";
  const reasons = Array.from(
    new Set(signals.flatMap((signal) => reasonMap[signal] ?? [])),
  );

  return (
    <div className="file-context-summary refactor-worthiness-summary">
      <div className="refactor-worthiness-heading">
        <h3>Refactor Worthiness</h3>
        <span className={`scope-pill urgency-pill ${urgencyClass}`}>
          Urgency: {formatReviewLabel(urgency)}
        </span>
      </div>

      <FileContextTraitList
        title="Why SCREEN thinks this"
        roles={["refactorWorthiness"]}
        traitMap={{ refactorWorthiness: signals }}
      />

      <FileContextTraitList
        title="Recommendation"
        roles={["refactorRecommendation"]}
        traitMap={{ refactorRecommendation: recommendations }}
      />

      <FileContextTraitList
        title="Reason tags"
        roles={["refactorReasons"]}
        traitMap={{ refactorReasons: reasons }}
      />
    </div>
  );
}

function DomainCohesionSummary({
  cohesion = "unknown",
  activeDomains = [],
  signals = [],
  recommendations = [],
  reasonMap = {},
}) {
  const hasDomainData =
    cohesion !== "unknown" ||
    activeDomains.length > 0 ||
    signals.length > 0 ||
    recommendations.length > 0;

  if (!hasDomainData) {
    return null;
  }

  const cohesionClass = COHESION_CLASS_BY_VALUE[cohesion] ?? "unknown";
  const reasons = Array.from(
    new Set(signals.flatMap((signal) => reasonMap[signal] ?? [])),
  );

  return (
    <div className="file-context-summary domain-cohesion-summary">
      <div className="refactor-worthiness-heading">
        <h3>Domain Cohesion</h3>
        <span className={`scope-pill cohesion-pill ${cohesionClass}`}>
          {formatReviewLabel(cohesion)}
        </span>
      </div>

      <FileContextTraitList
        title="Active responsibility domains"
        roles={["activeDomains"]}
        traitMap={{ activeDomains }}
      />

      <FileContextTraitList
        title="Cohesion signals"
        roles={["domainSignals"]}
        traitMap={{ domainSignals: signals }}
      />

      <FileContextTraitList
        title="Recommendation"
        roles={["domainRecommendations"]}
        traitMap={{ domainRecommendations: recommendations }}
      />

      <FileContextTraitList
        title="Reason tags"
        roles={["domainReasons"]}
        traitMap={{ domainReasons: reasons }}
      />
    </div>
  );
}

function ExtractionOrderSummary({ steps = [], reasonMap = {} }) {
  if (!steps.length) {
    return null;
  }

  return (
    <div className="file-context-summary extraction-order-summary">
      <div className="refactor-worthiness-heading">
        <h3>Safest First Move</h3>
        <span className="scope-pill subtle">
          Ordered by behavior risk
        </span>
      </div>

      <ol className="extraction-step-list">
        {steps.map((step) => {
          const reasons = reasonMap[step] ?? [];

          return (
            <li className="extraction-step-card" key={step}>
              <strong>{formatReviewLabel(step)}</strong>

              {reasons.length ? (
                <div className="file-context-role-list">
                  {reasons.map((reason) => (
                    <span className="scope-pill subtle" key={reason}>
                      {formatReviewLabel(reason)}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SignalTrustSummary({ signalConfidence = {} }) {
  const entries = Object.entries(signalConfidence);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="file-context-summary signal-trust-summary">
      <div className="refactor-worthiness-heading">
        <h3>Signal Trust</h3>
        <span className="scope-pill subtle">
          Evidence-backed warnings
        </span>
      </div>

      <div className="signal-trust-list">
        {entries.map(([signal, details]) => {
          const level = details?.level ?? "low";
          const evidence = details?.evidence ?? [];
          const reason = details?.reason;

          return (
            <article className="signal-trust-card" key={signal}>
              <div className="signal-trust-card-header">
                <strong>{formatReviewLabel(signal)}</strong>
                <span className={`scope-pill confidence-pill ${level}`}>
                  {formatReviewLabel(level)} confidence
                </span>
              </div>

              {reason ? <p className="muted">{reason}</p> : null}

              {evidence.length ? (
                <ul className="signal-evidence-list">
                  {evidence.map((item, index) => (
                    <li key={`${signal}-${item.source}-${index}`}>
                      <code>{item.source}</code>
                      <span>{item.reason}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function FileContextTraitList({ title, roles, traitMap }) {
  const traits = Array.from(
    new Set(roles.flatMap((role) => traitMap[role] ?? [])),
  );

  if (!traits.length) {
    return null;
  }

  return (
    <div className="file-context-traits">
      <p className="muted">{title}:</p>
      <div className="file-context-role-list">
        {traits.map((trait) => (
          <span className="scope-pill subtle" key={trait}>
            {formatReviewLabel(trait)}
          </span>
        ))}
      </div>
    </div>
  );
}