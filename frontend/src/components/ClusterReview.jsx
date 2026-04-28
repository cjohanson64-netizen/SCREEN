import { formatReviewLabel } from "../utils/formatters";

const CLUSTER_ORDER = [
  "risk_cluster",
  "size_cluster",
  "complexity_cluster",
  "structure_cluster",
  "repetition_cluster",
];

const CLUSTER_LABELS = {
  risk_cluster: "Risk",
  size_cluster: "Size",
  complexity_cluster: "Complexity",
  structure_cluster: "Structure",
  repetition_cluster: "Repetition",
};

export default function ClusterReview({ clusters = {} }) {
  const visibleClusters = CLUSTER_ORDER.filter(
    (clusterName) => clusters[clusterName]?.length > 0,
  );

  if (!visibleClusters.length) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Semantic Signal Clusters</h2>
      <p className="muted">
        These groups come from TAT cluster relationships.
      </p>

      <div className="cluster-grid">
        {visibleClusters.map((clusterName) => (
          <div className="cluster-card" key={clusterName}>
            <h3>{CLUSTER_LABELS[clusterName] ?? formatReviewLabel(clusterName)}</h3>

            <div className="cluster-signal-list">
              {clusters[clusterName].map((signal) => (
                <span className="cluster-signal" key={signal}>
                  {formatReviewLabel(signal)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}