export default function PromptChainViewer({ recommendation }) {
  if (!recommendation?.stages?.length) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Prompt Chain Recommendation</h2>
          <p className="muted">{recommendation.title}</p>
        </div>
      </div>

      <div className="prompt-chain-list">
        {recommendation.stages.map((stage, index) => (
          <article
            className="prompt-chain-card"
            key={`${stage.stage}-${index}`}
          >
            <div className="prompt-chain-header">
              <div>
                <strong>
                  {index + 1}. {stage.title} {" "}
                </strong>
                <span className={`severity ${stage.riskLevel}`}>
                  {stage.riskLevel}
                </span>
              </div>
            </div>

            <p className="muted">{stage.reason}</p>

            <div className="prompt-chain-meta">
              <span>Stage: {stage.stage} </span>
              <br />
              <span>Score: {stage.score}</span>
            </div>

            <pre className="ai-prompt">{stage.promptText}</pre>

            <div className="prompt-actions">
              <button
                onClick={() => navigator.clipboard.writeText(stage.promptText)}
              >
                Copy Prompt
              </button>
            </div>
            <hr />
          </article>
        ))}
      </div>
    </section>
  );
}
