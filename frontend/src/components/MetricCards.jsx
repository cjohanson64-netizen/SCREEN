import FunctionProfilePanel from "./FunctionProfilePanel";
import ConstantProfilePanel from "./ConstantProfilePanel";
import ImportExportProfilePanel from "./ImportExportProfilePanel";

export default function MetricCards({ metrics }) {
  const functionProfile = metrics.functionProfile ?? {};
  const constantProfile = metrics.constantProfile ?? {};
  const importProfile = metrics.importProfile ?? {};
  const exportProfile = metrics.exportProfile ?? {};

  const cards = [
    ["Lines", metrics.lineCount],
    ["Tokens", metrics.tokenEstimate],
    ["Functions", metrics.functionCount],
    ["Hooks", functionProfile.hookCount ?? 0],
    ["Components", functionProfile.componentCount ?? 0],
    ["Constants", metrics.constantCount ?? constantProfile.total ?? 0],
    ["Boolean Consts", constantProfile.booleanLikeCount ?? 0],
    ["Render Projection", constantProfile.renderDataProjectionCount ?? 0],
    ["Imports", importProfile.total ?? metrics.semanticImportCount ?? 0],
    ["Exports", exportProfile.total ?? metrics.semanticExportCount ?? 0],
    ["Import Zones", importProfile.responsibilityCategoryCount ?? 0],
    ["Export Roles", exportProfile.responsibilityRoleCount ?? 0],
    ["Blocks", metrics.blockCount],
    ["Max Nesting", metrics.maxNestingDepth],
    ["Complexity", metrics.complexity?.complexityScore ?? 0],
    ["Repetition", metrics.repetition?.repetitionScore ?? 0],
  ];

  return (
    <section className="panel">
      <h2>Metrics</h2>

      <div className="metric-grid">
        {cards.map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <FunctionProfilePanel functionProfile={functionProfile} />
      <ConstantProfilePanel constantProfile={constantProfile} />
      <ImportExportProfilePanel
        importProfile={importProfile}
        exportProfile={exportProfile}
      />
    </section>
  );
}