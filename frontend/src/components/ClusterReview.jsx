import { formatReviewLabel } from "../utils/formatters";

const CLUSTER_ORDER = [
  "risk_cluster",
  "structure_cluster",
  "function_profile_cluster",
  "constant_profile_cluster",
  "boolean_logic_cluster",
  "configuration_cluster",
  "ui_state_cluster",
  "complexity_cluster",
  "react_cluster",
  "data_access_cluster",
  "rule_logic_cluster",
  "analysis_cluster",
  "interaction_cluster",
  "repetition_cluster",
  "render_projection_cluster",
  "view_model_cluster",
  "action_guard_cluster",
  "import_profile_cluster",
  "export_profile_cluster",
  "architecture_boundary_cluster",
  "public_api_cluster",
  "dependency_coupling_cluster",
];

const CLUSTER_LABELS = {
  risk_cluster: "Risk",
  size_cluster: "Size",
  complexity_cluster: "Complexity",
  structure_cluster: "Structure",
  repetition_cluster: "Repetition",
  render_projection_cluster: "Render Projection",
  view_model_cluster: "View Model",
  action_guard_cluster: "Action Guards",
  import_profile_cluster: "Imports",
  export_profile_cluster: "Exports",
  architecture_boundary_cluster: "Architecture Boundaries",
  public_api_cluster: "Public API",
  dependency_coupling_cluster: "Dependency Coupling",
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