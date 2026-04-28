import ReviewGroup from "./ReviewGroup";
import { buildMiniPrompt } from "../utils/buildMiniPrompt";

export default function TatReview({ review, code }) {
  const signals = review.signals ?? [];
  const risks = review.risks ?? [];

  return (
    <section className="panel">
      <h2>Semantic Review</h2>

      <div className={review.success ? "status success" : "status failure"}>
        {review.success ? "Semantic review succeeded" : "TAT review failed"}
      </div>

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
