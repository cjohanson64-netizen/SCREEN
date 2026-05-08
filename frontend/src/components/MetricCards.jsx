import FunctionProfilePanel from "./FunctionProfilePanel";
import ConstantProfilePanel from "./ConstantProfilePanel";
import ImportExportProfilePanel from "./ImportExportProfilePanel";

function isScopeSelected(analysisScopes = [], scope) {
  return analysisScopes.includes("full") || analysisScopes.includes(scope);
}

export default function MetricCards({ metrics, analysisScopes = ["full"] }) {
  const functionProfile = metrics.functionProfile ?? {};
  const constantProfile = metrics.constantProfile ?? {};
  const importProfile = metrics.importProfile ?? {};
  const exportProfile = metrics.exportProfile ?? {};

  const showStructure = isScopeSelected(analysisScopes, "structure");
  const showFunctions = isScopeSelected(analysisScopes, "functions");
  const showConstants = isScopeSelected(analysisScopes, "constants");
  const showImports = isScopeSelected(analysisScopes, "imports");
  const showExports = isScopeSelected(analysisScopes, "exports");
  const showLoops = isScopeSelected(analysisScopes, "loops");
  const showComplexity = isScopeSelected(analysisScopes, "complexity");
  const showRisk = isScopeSelected(analysisScopes, "risk");

  const cards = [
    showStructure ? ["Lines", metrics.lineCount] : null,
    showStructure ? ["Tokens", metrics.tokenEstimate] : null,
    showStructure ? ["Blocks", metrics.blockCount] : null,
    showStructure ? ["Max Nesting", metrics.maxNestingDepth] : null,

    showFunctions ? ["Functions", metrics.functionCount] : null,
    showFunctions ? ["Hooks", functionProfile.hookCount ?? 0] : null,
    showFunctions ? ["Components", functionProfile.componentCount ?? 0] : null,

    showConstants ? ["Constants", metrics.constantCount ?? constantProfile.total ?? 0] : null,
    showConstants ? ["Boolean Consts", constantProfile.booleanLikeCount ?? 0] : null,
    showConstants ? ["Render Projection", constantProfile.renderDataProjectionCount ?? 0] : null,

    showImports ? ["Imports", importProfile.total ?? metrics.semanticImportCount ?? 0] : null,
    showImports ? ["Import Zones", importProfile.responsibilityCategoryCount ?? 0] : null,

    showExports ? ["Exports", exportProfile.total ?? metrics.semanticExportCount ?? 0] : null,
    showExports ? ["Export Roles", exportProfile.responsibilityRoleCount ?? 0] : null,

    showLoops ? ["Loops", metrics.loopCount ?? metrics.complexity?.loopCount ?? 0] : null,

    showComplexity ? ["Complexity", metrics.complexity?.complexityScore ?? 0] : null,
    showComplexity ? ["Repetition", metrics.repetition?.repetitionScore ?? 0] : null,

    showRisk ? ["Risk Score", metrics.complexity?.complexityScore ?? 0] : null,
  ].filter(Boolean);

  return (
    <section className="panel">
      <h2>Metrics</h2>

      {cards.length > 0 ? (
        <div className="metric-grid">
          {cards.map(([label, value]) => (
            <div className="metric-card" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">
          No raw metric cards are shown for the selected analysis scope.
        </p>
      )}

      {showFunctions ? (
        <FunctionProfilePanel functionProfile={functionProfile} />
      ) : null}

      {showConstants ? (
        <ConstantProfilePanel constantProfile={constantProfile} />
      ) : null}

      {showImports || showExports ? (
        <ImportExportProfilePanel
          importProfile={importProfile}
          exportProfile={exportProfile}
          showImports={showImports}
          showExports={showExports}
        />
      ) : null}
    </section>
  );
}
