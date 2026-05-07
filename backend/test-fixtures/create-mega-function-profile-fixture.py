from pathlib import Path


OUTPUT_PATH = Path("test-fixtures/function-profile-mega-stress-test.jsx")


def main():
    lines = []

    def add(text=""):
        lines.append(text)

    add('import { useEffect, useMemo, useReducer, useState } from "react";')
    add("")
    add("// Mega SCREEN function-profile stress test")
    add("// This file is intentionally oversized and over-clustered.")
    add("// It is not meant to be beautiful app code.")
    add("// It is meant to trigger SCREEN's semantic function-profile layer.")
    add("")

    add("const INITIAL_FILTERS = {")
    for key in ["text", "risk", "owner", "status", "category", "sort", "direction"]:
        add(f'  {key}: "",')
    add("};")
    add("")

    add("const INITIAL_STATE = {")
    add("  files: [],")
    add("  selectedFile: null,")
    add("  filters: INITIAL_FILTERS,")
    add("  debugOpen: false,")
    add("  promptOpen: false,")
    add("  lastAnalysis: null,")
    add("};")
    add("")

    add("export default function MegaDashboard() {")
    add("  const [state, dispatch] = useReducer(dashboardReducer, INITIAL_STATE);")
    add("  const [notice, setNotice] = useState('Ready');")
    add("  const projectHealth = useProjectHealthModel();")
    add("  const fileRisk = useFileRiskModel(projectHealth.files);")
    add("  const promptChain = usePromptChainModel(fileRisk);")
    add("  const semanticReview = useSemanticReviewModel(fileRisk);")
    add("  const filteredFiles = useMemo(() => {")
    add("    return getVisibleFiles(projectHealth.files, state.filters);")
    add("  }, [projectHealth.files, state.filters]);")
    add("  useEffect(() => {")
    add("    dispatch({ type: 'filesLoaded', files: projectHealth.files });")
    add("  }, [projectHealth.files]);")
    add("  function handleSelectFile(file) {")
    add("    dispatch({ type: 'selectFile', file });")
    add("  }")
    add("  function handleRunReview() {")
    add("    const review = analyzeProjectRisk(projectHealth.files);")
    add("    setNotice(formatReviewNotice(review));")
    add("    dispatch({ type: 'analysisComplete', analysis: review });")
    add("  }")
    add("  function handleResetFilters() {")
    add("    dispatch({ type: 'filtersReset' });")
    add("  }")
    add("  return (")
    add('    <main className="mega-dashboard">')
    add("      <MegaHeader notice={notice} onRunReview={handleRunReview} />")
    add("      <MegaToolbar filters={state.filters} dispatch={dispatch} onReset={handleResetFilters} />")
    add("      <DashboardSummary files={filteredFiles} risk={fileRisk} />")
    add("      <FileList files={filteredFiles} onSelectFile={handleSelectFile} />")
    add("      <ReviewWorkspace state={state} risk={fileRisk} promptChain={promptChain} semanticReview={semanticReview} />")
    add("    </main>")
    add("  );")
    add("}")
    add("")

    add_component_functions(add)
    add_hook_functions(add)
    add_getter_functions(add)
    add_predicate_functions(add)
    add_analyzer_functions(add)
    add_handler_functions(add)
    add_builder_functions(add)
    add_transformer_functions(add)
    add_io_functions(add)
    add_orchestrator_functions(add)
    add_reducer(add)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")

    print(f"Created {OUTPUT_PATH}")
    print(f"Line count: {len(lines)}")
    print("")
    print("Expected SCREEN signals:")
    print("- component_heavy")
    print("- hook_heavy")
    print("- getter_heavy")
    print("- predicate_heavy")
    print("- analyzer_heavy")
    print("- handler_heavy")
    print("- builder_heavy")
    print("- transformer_heavy")
    print("- io_heavy")
    print("- orchestrator_heavy")
    print("- function_heavy")
    print("- long_file")


def add_component_functions(add):
    components = [
        "MegaHeader",
        "MegaToolbar",
        "DashboardSummary",
        "FileList",
        "FileRow",
        "ReviewWorkspace",
        "RiskPanel",
        "PromptPanel",
        "SemanticPanel",
        "DebugPanel",
        "MetricTile",
        "SignalBadge",
        "FindingCard",
        "ClusterCard",
        "ActionBar",
        "EmptyState",
        "LoadingState",
        "ErrorState",
        "FilterGroup",
        "SortMenu",
    ]

    add("// -----------------------------")
    add("// Component-shaped functions")
    add("// Expected: component_heavy")
    add("// -----------------------------")
    add("")

    for component in components:
        add(f"function {component}(props) {{")
        add(f"  const title = props.title ?? '{component}';")
        add("  const items = props.items ?? props.files ?? [];")
        add("  const count = Array.isArray(items) ? items.length : 0;")
        add("  const detail = props.detail ?? `${title}: ${count}`;")
        add("  return (")
        add(f'    <section className="{component}">')
        add("      <h2>{title}</h2>")
        add("      <p>{detail}</p>")
        add("    </section>")
        add("  );")
        add("}")
        add("")


def add_hook_functions(add):
    hooks = [
        "useProjectHealthModel",
        "useFileRiskModel",
        "usePromptChainModel",
        "useSemanticReviewModel",
        "useFileSelection",
        "useFilterState",
        "useRiskThresholds",
        "useAnalysisHistory",
        "useKeyboardShortcuts",
        "useReviewNotice",
        "useProjectGraph",
        "usePromptPreview",
    ]

    add("// -----------------------------")
    add("// Hook-shaped functions")
    add("// Expected: hook_heavy")
    add("// -----------------------------")
    add("")

    for hook in hooks:
        param = "" if hook == "useProjectHealthModel" else "input"
        add(f"function {hook}({param}) {{")
        add("  const [value, setValue] = useState(null);")
        add("  useEffect(() => {")
        add("    setValue(buildDefaultModel(input));")
        add("  }, [input]);")
        add("  return value ?? buildDefaultModel(input);")
        add("}")
        add("")


def add_getter_functions(add):
    getters = [
        "getVisibleFiles",
        "getFileRiskScore",
        "getFileRiskLevel",
        "getDominantSignal",
        "getClusterNames",
        "getPromptStages",
        "getFindingSummary",
        "getSortedFiles",
        "getFilteredFiles",
        "getOwnerName",
        "getStatusLabel",
        "getCategoryLabel",
        "getLineCount",
        "getFunctionCount",
        "getHookCount",
        "getComponentCount",
    ]

    add("// -----------------------------")
    add("// Getter-shaped functions")
    add("// Expected: getter_heavy")
    add("// -----------------------------")
    add("")

    for getter in getters:
        add(f"function {getter}(input, options = {{}}) {{")
        add("  const source = Array.isArray(input) ? input : input?.items ?? [];")
        add("  if (Array.isArray(source)) {")
        add("    return source.filter(Boolean);")
        add("  }")
        add("  return input?.value ?? input?.score ?? options.fallback ?? 0;")
        add("}")
        add("")


def add_predicate_functions(add):
    predicates = [
        "hasHighRisk",
        "hasMediumRisk",
        "hasManyHooks",
        "hasManyComponents",
        "hasAnalyzerCluster",
        "hasHandlerCluster",
        "isRefactorCandidate",
        "isReviewableFile",
        "isFrontendFile",
        "isBackendFile",
        "canExtractHooks",
        "canSplitComponents",
        "shouldCreateService",
        "shouldCreateAnalyzerModule",
        "shouldReduceNesting",
        "shouldExtractPredicates",
        "shouldGeneratePrompt",
        "shouldBlockFeatureWork",
    ]

    add("// -----------------------------")
    add("// Predicate-shaped functions")
    add("// Expected: predicate_heavy")
    add("// -----------------------------")
    add("")

    for predicate in predicates:
        add(f"function {predicate}(file, metrics = {{}}) {{")
        add("  const score = metrics.score ?? file?.riskScore ?? 0;")
        add("  const count = metrics.count ?? file?.functionCount ?? 0;")
        add("  return score > 50 || count > 8;")
        add("}")
        add("")


def add_analyzer_functions(add):
    analyzers = [
        "analyzeProjectRisk",
        "analyzeFileRisk",
        "analyzeFunctionProfile",
        "analyzeComponentDensity",
        "analyzeHookDensity",
        "analyzePredicateDensity",
        "analyzeHandlerDensity",
        "analyzeImportPressure",
        "analyzeDependencyShape",
        "analyzePromptTargets",
        "detectFunctionNames",
        "detectComponentNames",
        "detectHookNames",
        "detectPredicateNames",
        "detectHandlerNames",
        "detectAnalyzerNames",
        "detectRiskClusters",
        "detectExtractionTargets",
    ]

    add("// -----------------------------")
    add("// Analyzer-shaped functions")
    add("// Expected: analyzer_heavy")
    add("// -----------------------------")
    add("")

    for analyzer in analyzers:
        add(f"function {analyzer}(input) {{")
        add("  const items = Array.isArray(input) ? input : input?.files ?? [];")
        add("  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);")
        add("  return {")
        add(f"    type: '{analyzer}',")
        add("    count: items.length,")
        add("    score,")
        add("    status: score > 100 ? 'high' : 'medium',")
        add("  };")
        add("}")
        add("")


def add_handler_functions(add):
    handlers = [
        "handleFileClick",
        "handleFilterChange",
        "handleSortChange",
        "handleRiskToggle",
        "handlePromptCopy",
        "handlePromptRun",
        "handleClusterClick",
        "handleFindingClick",
        "handleResetDashboard",
        "handleRefreshProject",
        "handleUploadZip",
        "handleDownloadReport",
        "handleOpenDebug",
        "handleCloseDebug",
        "togglePromptPanel",
        "toggleDebugPanel",
        "toggleClusterGroup",
        "toggleRiskDetails",
    ]

    add("// -----------------------------")
    add("// Handler-shaped functions")
    add("// Expected: handler_heavy")
    add("// -----------------------------")
    add("")

    for handler in handlers:
        add(f"function {handler}(eventOrValue, dispatch = () => {{}}) {{")
        add("  const value = eventOrValue?.target?.value ?? eventOrValue;")
        add(f"  dispatch({{ type: '{handler}', value }});")
        add("  return value;")
        add("}")
        add("")


def add_builder_functions(add):
    builders = [
        "buildDefaultModel",
        "buildRiskSummary",
        "buildPromptChain",
        "buildReviewFinding",
        "buildSignalCluster",
        "buildMetricTiles",
        "buildProjectGraph",
        "buildFileNode",
        "buildDependencyEdge",
        "buildExtractionPlan",
        "createReviewConfig",
        "createPromptConfig",
        "createRiskThresholds",
        "createEmptyAnalysis",
    ]

    add("// -----------------------------")
    add("// Builder-shaped functions")
    add("// Expected: builder_heavy")
    add("// -----------------------------")
    add("")

    for builder in builders:
        add(f"function {builder}(input = {{}}) {{")
        add("  return {")
        add(f"    kind: '{builder}',")
        add("    input,")
        add("    createdAt: Date.now(),")
        add("  };")
        add("}")
        add("")


def add_transformer_functions(add):
    transformers = [
        "parseReviewPayload",
        "parseMetricsPayload",
        "formatReviewNotice",
        "formatSignalLabel",
        "formatRiskLevel",
        "formatPromptStage",
        "normalizeFilePath",
        "normalizeSignalName",
        "normalizeRiskScore",
        "transformGraphNodes",
        "transformGraphEdges",
        "mapFindingsToCards",
        "reduceSignalsToClusters",
        "sortFilesByRisk",
    ]

    add("// -----------------------------")
    add("// Transformer-shaped functions")
    add("// Expected: transformer_heavy")
    add("// -----------------------------")
    add("")

    for transformer in transformers:
        add(f"function {transformer}(input) {{")
        add("  if (Array.isArray(input)) {")
        add("    return input.map((item) => ({ ...item }));")
        add("  }")
        add("  if (typeof input === 'string') {")
        add("    return input.trim().replaceAll('_', ' ');")
        add("  }")
        add("  return input ?? null;")
        add("}")
        add("")


def add_io_functions(add):
    io_functions = [
        "fetchProjectGraph",
        "fetchFileContent",
        "fetchReviewResult",
        "fetchPromptChain",
        "loadCachedAnalysis",
        "loadUserSettings",
        "saveReviewResult",
        "savePromptChain",
        "sendReviewTelemetry",
        "postRefactorRequest",
    ]

    add("// -----------------------------")
    add("// IO-shaped functions")
    add("// Expected: io_heavy")
    add("// -----------------------------")
    add("")

    for io_function in io_functions:
        add(f"async function {io_function}(input) {{")
        add("  await Promise.resolve();")
        add("  return { ok: true, input };")
        add("}")
        add("")


def add_orchestrator_functions(add):
    orchestrators = [
        "runFullReview",
        "runFunctionProfileReview",
        "runPromptChainBuild",
        "executeReviewPipeline",
        "executeExtractionPlan",
        "executePromptSequence",
        "applyReviewFindings",
        "applyFilterState",
        "applySortState",
        "applyRiskThresholds",
    ]

    add("// -----------------------------")
    add("// Orchestrator-shaped functions")
    add("// Expected: orchestrator_heavy")
    add("// -----------------------------")
    add("")

    for orchestrator in orchestrators:
        add(f"function {orchestrator}(input) {{")
        add("  const normalized = normalizeRiskScore(input);")
        add("  const analysis = analyzeFileRisk(normalized);")
        add("  const plan = buildExtractionPlan(analysis);")
        add("  return { normalized, analysis, plan };")
        add("}")
        add("")


def add_reducer(add):
    add("// -----------------------------")
    add("// Reducer / decision-heavy logic")
    add("// Expected: complexity-related signals")
    add("// -----------------------------")
    add("")

    add("function dashboardReducer(state, action) {")
    add("  switch (action.type) {")
    for action_type in [
        "filesLoaded",
        "selectFile",
        "analysisComplete",
        "filtersReset",
        "handleFilterChange",
        "handleSortChange",
        "togglePromptPanel",
        "toggleDebugPanel",
        "handleFileClick",
        "handleRiskToggle",
        "handlePromptRun",
        "handleClusterClick",
        "handleFindingClick",
        "handleResetDashboard",
        "handleRefreshProject",
        "handleUploadZip",
        "handleDownloadReport",
    ]:
        add(f"    case '{action_type}':")
        add("      return {")
        add("        ...state,")
        add("        lastAction: action.type,")
        add("        lastPayload: action.value ?? action.file ?? action.files ?? null,")
        add("      };")
    add("    default:")
    add("      return state;")
    add("  }")
    add("}")


if __name__ == "__main__":
    main()