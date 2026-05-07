import { useEffect, useMemo, useReducer, useState } from "react";

/**
 * MegaFunctionProfileStressTest.jsx
 *
 * This file is intentionally oversized and semantically noisy.
 * It exists to test SCREEN's function-profile analyzer.
 *
 * Expected signals:
 * - long_file
 * - function_heavy
 * - hook_heavy
 * - component_heavy
 * - getter_heavy
 * - predicate_heavy
 * - analyzer_heavy
 * - handler_heavy
 * - builder_heavy
 * - transformer_heavy
 * - io_heavy
 * - orchestrator_heavy
 */

const INITIAL_FILTERS = {
  text: "",
  owner: "",
  risk: "",
  status: "",
  category: "",
  sortBy: "risk",
  direction: "desc",
};

const INITIAL_STATE = {
  files: [],
  selectedFile: null,
  filters: INITIAL_FILTERS,
  analysis: null,
  debugOpen: false,
  promptOpen: false,
  selectedCluster: null,
  selectedFinding: null,
  notice: "Ready",
};

export default function MegaFunctionProfileStressTest() {
  const [state, dispatch] = useReducer(dashboardReducer, INITIAL_STATE);
  const [localNotice, setLocalNotice] = useState("Ready");

  const projectHealth = useProjectHealthModel();
  const fileRisk = useFileRiskModel(projectHealth.files);
  const promptChain = usePromptChainModel(fileRisk);
  const semanticReview = useSemanticReviewModel(fileRisk);
  const projectGraph = useProjectGraphModel(projectHealth.files);
  const promptPreview = usePromptPreviewModel(promptChain);
  const reviewNotice = useReviewNoticeModel(fileRisk);
  const analysisHistory = useAnalysisHistoryModel();

  const visibleFiles = useMemo(() => {
    return getVisibleFiles(projectHealth.files, state.filters);
  }, [projectHealth.files, state.filters]);

  const summary = useMemo(() => {
    return buildRiskSummary(visibleFiles);
  }, [visibleFiles]);

  useEffect(() => {
    dispatch({ type: "filesLoaded", files: projectHealth.files });
  }, [projectHealth.files]);

  function handleSelectFile(file) {
    dispatch({ type: "selectFile", file });
  }

  function handleRunReview() {
    const review = runFullReview(projectHealth.files);
    const notice = formatReviewNotice(review);
    setLocalNotice(notice);
    dispatch({ type: "analysisComplete", analysis: review });
  }

  function handleResetFilters() {
    dispatch({ type: "filtersReset" });
  }

  function handleToggleDebug() {
    dispatch({ type: "toggleDebugPanel" });
  }

  function handleTogglePrompt() {
    dispatch({ type: "togglePromptPanel" });
  }

  return (
    <main className="mega-function-profile-stress-test">
      <MegaHeader
        notice={localNotice}
        reviewNotice={reviewNotice}
        onRunReview={handleRunReview}
      />

      <MegaToolbar
        filters={state.filters}
        dispatch={dispatch}
        onReset={handleResetFilters}
      />

      <DashboardSummary
        files={visibleFiles}
        summary={summary}
        risk={fileRisk}
      />

      <FileList
        files={visibleFiles}
        selectedFile={state.selectedFile}
        onSelectFile={handleSelectFile}
      />

      <ReviewWorkspace
        state={state}
        risk={fileRisk}
        promptChain={promptChain}
        semanticReview={semanticReview}
        projectGraph={projectGraph}
        promptPreview={promptPreview}
        history={analysisHistory}
      />

      <ActionBar
        onToggleDebug={handleToggleDebug}
        onTogglePrompt={handleTogglePrompt}
      />
    </main>
  );
}

// -----------------------------------------------------------------------------
// Component-shaped functions
// Expected: component_heavy
// -----------------------------------------------------------------------------

function MegaHeader({ notice, reviewNotice, onRunReview }) {
  return (
    <header className="mega-header">
      <h1>SCREEN Mega Function Profile Stress Test</h1>
      <p>{notice}</p>
      <p>{reviewNotice.label}</p>
      <button onClick={onRunReview}>Run Review</button>
    </header>
  );
}

function MegaToolbar({ filters, dispatch, onReset }) {
  return (
    <section className="mega-toolbar">
      <FilterGroup filters={filters} dispatch={dispatch} />
      <SortMenu filters={filters} dispatch={dispatch} />
      <button onClick={onReset}>Reset</button>
    </section>
  );
}

function DashboardSummary({ files, summary, risk }) {
  return (
    <section className="dashboard-summary">
      <MetricTile label="Files" value={files.length} />
      <MetricTile label="Risk" value={risk.level} />
      <MetricTile label="Score" value={summary.score} />
    </section>
  );
}

function FileList({ files, selectedFile, onSelectFile }) {
  return (
    <section className="file-list">
      <h2>Files</h2>
      {files.map((file) => (
        <FileRow
          key={file.path}
          file={file}
          selected={selectedFile?.path === file.path}
          onSelectFile={onSelectFile}
        />
      ))}
    </section>
  );
}

function FileRow({ file, selected, onSelectFile }) {
  return (
    <article className={selected ? "file-row selected" : "file-row"}>
      <button onClick={() => onSelectFile(file)}>{file.path}</button>
      <SignalBadge signal={file.signal} />
    </article>
  );
}

function ReviewWorkspace({
  state,
  risk,
  promptChain,
  semanticReview,
  projectGraph,
  promptPreview,
  history,
}) {
  return (
    <section className="review-workspace">
      <RiskPanel risk={risk} />
      <PromptPanel promptChain={promptChain} promptPreview={promptPreview} />
      <SemanticPanel semanticReview={semanticReview} />
      <DebugPanel state={state} projectGraph={projectGraph} history={history} />
    </section>
  );
}

function RiskPanel({ risk }) {
  return (
    <section className="risk-panel">
      <h2>Risk</h2>
      <p>{risk.level}</p>
      <p>{risk.score}</p>
    </section>
  );
}

function PromptPanel({ promptChain, promptPreview }) {
  return (
    <section className="prompt-panel">
      <h2>{promptChain.title}</h2>
      <pre>{promptPreview.text}</pre>
    </section>
  );
}

function SemanticPanel({ semanticReview }) {
  return (
    <section className="semantic-panel">
      <h2>Semantic Review</h2>
      {semanticReview.signals.map((signal) => (
        <SignalBadge key={signal} signal={signal} />
      ))}
    </section>
  );
}

function DebugPanel({ state, projectGraph, history }) {
  return (
    <section className="debug-panel">
      <h2>Debug</h2>
      <pre>{JSON.stringify({ state, projectGraph, history }, null, 2)}</pre>
    </section>
  );
}

function MetricTile({ label, value }) {
  return (
    <article className="metric-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SignalBadge({ signal }) {
  return <span className="signal-badge">{formatSignalLabel(signal)}</span>;
}

function FindingCard({ finding }) {
  return (
    <article className="finding-card">
      <h3>{finding.message}</h3>
      <p>{finding.whyItMatters}</p>
    </article>
  );
}

function ClusterCard({ cluster }) {
  return (
    <article className="cluster-card">
      <h3>{cluster.name}</h3>
      <p>{cluster.signals.length} signals</p>
    </article>
  );
}

function ActionBar({ onToggleDebug, onTogglePrompt }) {
  return (
    <section className="action-bar">
      <button onClick={onToggleDebug}>Debug</button>
      <button onClick={onTogglePrompt}>Prompt</button>
    </section>
  );
}

function EmptyState() {
  return <p>No files found.</p>;
}

function LoadingState() {
  return <p>Loading project analysis...</p>;
}

function ErrorState({ message }) {
  return <p className="error">{message}</p>;
}

function FilterGroup({ filters, dispatch }) {
  return (
    <div className="filter-group">
      <input
        value={filters.text}
        onChange={(event) => handleFilterTextChange(event, dispatch)}
      />
    </div>
  );
}

function SortMenu({ filters, dispatch }) {
  return (
    <select
      value={filters.sortBy}
      onChange={(event) => handleSortChange(event, dispatch)}
    >
      <option value="risk">Risk</option>
      <option value="path">Path</option>
      <option value="owner">Owner</option>
    </select>
  );
}

// -----------------------------------------------------------------------------
// Hook-shaped functions
// Expected: hook_heavy
// -----------------------------------------------------------------------------

function useProjectHealthModel() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    setFiles(buildMockFiles());
  }, []);

  return {
    files,
    loaded: true,
    count: files.length,
  };
}

function useFileRiskModel(files) {
  const summary = useMemo(() => buildRiskSummary(files), [files]);

  return {
    level: getRiskLevel(summary),
    score: summary.score,
    factors: detectRiskClusters(files),
  };
}

function usePromptChainModel(risk) {
  return useMemo(() => buildPromptChain(risk), [risk]);
}

function useSemanticReviewModel(risk) {
  return useMemo(() => {
    return {
      signals: detectExtractionTargets(risk),
      risk,
    };
  }, [risk]);
}

function useProjectGraphModel(files) {
  return useMemo(() => buildProjectGraph(files), [files]);
}

function usePromptPreviewModel(promptChain) {
  return useMemo(() => {
    return {
      text: promptChain.stages.join("\n"),
    };
  }, [promptChain]);
}

function useReviewNoticeModel(risk) {
  return useMemo(() => {
    return {
      label: formatRiskLevel(risk.level),
      score: risk.score,
    };
  }, [risk]);
}

function useAnalysisHistoryModel() {
  const [history] = useState([
    { id: 1, label: "Initial review" },
    { id: 2, label: "Function profile review" },
  ]);

  return history;
}

function useFileSelectionModel(files) {
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  return {
    selectedFile,
    setSelectedFile,
  };
}

function useFilterStateModel() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  return {
    filters,
    setFilters,
  };
}

// -----------------------------------------------------------------------------
// Getter-shaped functions
// Expected: getter_heavy
// -----------------------------------------------------------------------------

function getVisibleFiles(files, filters) {
  return getSortedFiles(getFilteredFiles(files, filters), filters);
}

function getSortedFiles(files, filters) {
  const direction = filters.direction === "asc" ? 1 : -1;

  return [...files].sort((left, right) => {
    return getFileRiskScore(left) > getFileRiskScore(right)
      ? direction
      : -direction;
  });
}

function getFilteredFiles(files, filters) {
  return files.filter((file) => {
    return getFilePath(file).includes(filters.text || "");
  });
}

function getFilePath(file) {
  return file.path ?? "";
}

function getFileRiskScore(file) {
  return file.riskScore ?? 0;
}

function getFileRiskLevel(file) {
  if (getFileRiskScore(file) > 80) return "high";
  if (getFileRiskScore(file) > 40) return "medium";
  return "low";
}

function getRiskLevel(summary) {
  if (summary.score > 80) return "high";
  if (summary.score > 40) return "medium";
  return "low";
}

function getDominantSignal(file) {
  return file.signal ?? "none";
}

function getClusterNames(clusters) {
  return clusters.map((cluster) => cluster.name);
}

function getPromptStages(promptChain) {
  return promptChain.stages ?? [];
}

function getFindingSummary(finding) {
  return finding.message ?? "No summary";
}

function getOwnerName(file) {
  return file.owner ?? "Unknown";
}

function getStatusLabel(file) {
  return file.status ?? "unknown";
}

function getCategoryLabel(file) {
  return file.category ?? "general";
}

function getLineCount(file) {
  return file.lineCount ?? 0;
}

function getFunctionCount(file) {
  return file.functionCount ?? 0;
}

function getHookCount(file) {
  return file.hookCount ?? 0;
}

function getComponentCount(file) {
  return file.componentCount ?? 0;
}

// -----------------------------------------------------------------------------
// Predicate-shaped functions
// Expected: predicate_heavy
// -----------------------------------------------------------------------------

function hasHighRisk(file) {
  return getFileRiskScore(file) > 80;
}

function hasMediumRisk(file) {
  return getFileRiskScore(file) > 40 && getFileRiskScore(file) <= 80;
}

function hasManyHooks(file) {
  return getHookCount(file) > 3;
}

function hasManyComponents(file) {
  return getComponentCount(file) > 3;
}

function hasAnalyzerCluster(file) {
  return file.signals?.includes("analyzer_heavy") ?? false;
}

function hasHandlerCluster(file) {
  return file.signals?.includes("handler_heavy") ?? false;
}

function isRefactorCandidate(file) {
  return hasHighRisk(file) || getFunctionCount(file) > 12;
}

function isReviewableFile(file) {
  return file.path.endsWith(".js") || file.path.endsWith(".jsx");
}

function isFrontendFile(file) {
  return file.path.endsWith(".jsx") || file.path.endsWith(".tsx");
}

function isBackendFile(file) {
  return file.path.endsWith(".py") || file.path.endsWith(".go");
}

function canExtractHooks(file) {
  return hasManyHooks(file) && isFrontendFile(file);
}

function canSplitComponents(file) {
  return hasManyComponents(file) && isFrontendFile(file);
}

function shouldCreateService(file) {
  return file.signals?.includes("io_heavy") ?? false;
}

function shouldCreateAnalyzerModule(file) {
  return file.signals?.includes("analyzer_heavy") ?? false;
}

function shouldReduceNesting(file) {
  return file.maxNestingDepth > 4;
}

function shouldExtractPredicates(file) {
  return file.signals?.includes("predicate_heavy") ?? false;
}

function shouldGeneratePrompt(file) {
  return isRefactorCandidate(file) && isReviewableFile(file);
}

function shouldBlockFeatureWork(file) {
  return hasHighRisk(file) && file.signals?.includes("complexity_high");
}

// -----------------------------------------------------------------------------
// Analyzer-shaped functions
// Expected: analyzer_heavy
// -----------------------------------------------------------------------------

function analyzeProjectRisk(files) {
  const score = files.reduce((total, file) => total + getFileRiskScore(file), 0);

  return {
    score,
    level: score > 200 ? "high" : "medium",
    fileCount: files.length,
  };
}

function analyzeFileRisk(file) {
  return {
    path: file.path,
    score: getFileRiskScore(file),
    level: getFileRiskLevel(file),
  };
}

function analyzeFunctionProfile(file) {
  return {
    functions: getFunctionCount(file),
    hooks: getHookCount(file),
    components: getComponentCount(file),
  };
}

function analyzeComponentDensity(file) {
  return getComponentCount(file) / Math.max(getFunctionCount(file), 1);
}

function analyzeHookDensity(file) {
  return getHookCount(file) / Math.max(getFunctionCount(file), 1);
}

function analyzePredicateDensity(file) {
  return file.predicateCount / Math.max(getFunctionCount(file), 1);
}

function analyzeHandlerDensity(file) {
  return file.handlerCount / Math.max(getFunctionCount(file), 1);
}

function analyzeImportPressure(file) {
  return file.importCount > 10 ? "high" : "normal";
}

function analyzeDependencyShape(file) {
  return {
    fanIn: file.fanIn ?? 0,
    fanOut: file.fanOut ?? 0,
  };
}

function analyzePromptTargets(file) {
  return detectExtractionTargets(file);
}

function detectFunctionNames(code) {
  return code.match(/\bfunction\s+[A-Za-z_$][\w$]*/g) ?? [];
}

function detectComponentNames(code) {
  return detectFunctionNames(code).filter((name) => /function\s+[A-Z]/.test(name));
}

function detectHookNames(code) {
  return detectFunctionNames(code).filter((name) => /function\s+use[A-Z]/.test(name));
}

function detectPredicateNames(code) {
  return detectFunctionNames(code).filter((name) => {
    return /function\s+(has|is|can|should)[A-Z]/.test(name);
  });
}

function detectHandlerNames(code) {
  return detectFunctionNames(code).filter((name) => {
    return /function\s+(handle|toggle)[A-Z]/.test(name);
  });
}

function detectAnalyzerNames(code) {
  return detectFunctionNames(code).filter((name) => {
    return /function\s+(analyze|detect)[A-Z]/.test(name);
  });
}

function detectRiskClusters(files) {
  return files
    .filter((file) => hasHighRisk(file))
    .map((file) => getDominantSignal(file));
}

function detectExtractionTargets(input) {
  const signals = input.signals ?? input.factors ?? [];

  return signals.filter((signal) => {
    return signal.includes("heavy") || signal.includes("cluster");
  });
}

// -----------------------------------------------------------------------------
// Handler-shaped functions
// Expected: handler_heavy
// -----------------------------------------------------------------------------

function handleFileClick(file, dispatch) {
  dispatch({ type: "selectFile", file });
}

function handleFilterTextChange(event, dispatch) {
  dispatch({ type: "filterChanged", key: "text", value: event.target.value });
}

function handleFilterOwnerChange(event, dispatch) {
  dispatch({ type: "filterChanged", key: "owner", value: event.target.value });
}

function handleFilterRiskChange(event, dispatch) {
  dispatch({ type: "filterChanged", key: "risk", value: event.target.value });
}

function handleSortChange(event, dispatch) {
  dispatch({ type: "sortChanged", value: event.target.value });
}

function handleRiskToggle(file, dispatch) {
  dispatch({ type: "riskToggled", file });
}

function handlePromptCopy(prompt) {
  navigator.clipboard.writeText(prompt);
}

function handlePromptRun(prompt, dispatch) {
  dispatch({ type: "promptRun", prompt });
}

function handleClusterClick(cluster, dispatch) {
  dispatch({ type: "clusterSelected", cluster });
}

function handleFindingClick(finding, dispatch) {
  dispatch({ type: "findingSelected", finding });
}

function handleResetDashboard(dispatch) {
  dispatch({ type: "dashboardReset" });
}

function handleRefreshProject(dispatch) {
  dispatch({ type: "projectRefreshRequested" });
}

function handleUploadZip(file, dispatch) {
  dispatch({ type: "zipUploaded", file });
}

function handleDownloadReport(report) {
  const blob = new Blob([report], { type: "text/plain" });
  return URL.createObjectURL(blob);
}

function handleOpenDebug(dispatch) {
  dispatch({ type: "debugOpened" });
}

function handleCloseDebug(dispatch) {
  dispatch({ type: "debugClosed" });
}

function togglePromptPanel(dispatch) {
  dispatch({ type: "togglePromptPanel" });
}

function toggleDebugPanel(dispatch) {
  dispatch({ type: "toggleDebugPanel" });
}

function toggleClusterGroup(cluster, dispatch) {
  dispatch({ type: "toggleClusterGroup", cluster });
}

function toggleRiskDetails(file, dispatch) {
  dispatch({ type: "toggleRiskDetails", file });
}

// -----------------------------------------------------------------------------
// Builder-shaped functions
// Expected: builder_heavy
// -----------------------------------------------------------------------------

function buildMockFiles() {
  return [
    buildFileNode("src/App.jsx", 92, "hook_heavy"),
    buildFileNode("src/Dashboard.jsx", 84, "component_heavy"),
    buildFileNode("src/analyzer.js", 78, "analyzer_heavy"),
    buildFileNode("src/events.js", 64, "handler_heavy"),
  ];
}

function buildDefaultModel(input) {
  return {
    value: input ?? null,
    createdAt: Date.now(),
  };
}

function buildRiskSummary(files) {
  const score = files.reduce((total, file) => total + getFileRiskScore(file), 0);

  return {
    score,
    count: files.length,
    average: files.length ? Math.round(score / files.length) : 0,
  };
}

function buildPromptChain(risk) {
  return {
    title: "Function-profile refactor chain",
    stages: buildPromptStages(risk),
  };
}

function buildPromptStages(risk) {
  if (risk.level === "high") {
    return ["DISCOVER", "PLAN", "TRANSFORM", "VERIFY", "DOCUMENT"];
  }

  return ["REVIEW", "REFACTOR", "VERIFY"];
}

function buildReviewFinding(signal) {
  return {
    signal,
    message: formatSignalLabel(signal),
    whyItMatters: "This signal indicates clustered responsibility.",
  };
}

function buildSignalCluster(name, signals) {
  return {
    name,
    signals,
  };
}

function buildMetricTiles(summary) {
  return [
    { label: "Score", value: summary.score },
    { label: "Count", value: summary.count },
    { label: "Average", value: summary.average },
  ];
}

function buildProjectGraph(files) {
  return {
    nodes: files.map(buildFileNodeFromFile),
    edges: files.flatMap(buildDependencyEdgesForFile),
  };
}

function buildFileNode(path, riskScore, signal) {
  return {
    path,
    riskScore,
    signal,
    functionCount: riskScore > 80 ? 20 : 8,
    hookCount: signal === "hook_heavy" ? 6 : 1,
    componentCount: signal === "component_heavy" ? 6 : 1,
    signals: [signal],
  };
}

function buildFileNodeFromFile(file) {
  return {
    id: file.path,
    label: file.path,
    riskScore: file.riskScore,
  };
}

function buildDependencyEdgesForFile(file) {
  return (file.imports ?? []).map((target) => {
    return buildDependencyEdge(file.path, target);
  });
}

function buildDependencyEdge(source, target) {
  return {
    source,
    target,
    relation: "imports",
  };
}

function buildExtractionPlan(analysis) {
  return {
    analysis,
    steps: ["identify cluster", "extract module", "verify behavior"],
  };
}

function createReviewConfig() {
  return {
    strictness: "behavior_preserving",
    outputFormat: "full_files",
  };
}

function createPromptConfig() {
  return {
    task: "review",
    architecture: "pipeline",
  };
}

function createRiskThresholds() {
  return {
    high: 80,
    medium: 40,
    low: 0,
  };
}

function createEmptyAnalysis() {
  return {
    score: 0,
    findings: [],
    signals: [],
  };
}

// -----------------------------------------------------------------------------
// Transformer-shaped functions
// Expected: transformer_heavy
// -----------------------------------------------------------------------------

function parseReviewPayload(payload) {
  return JSON.parse(payload);
}

function parseMetricsPayload(payload) {
  return JSON.parse(payload);
}

function formatReviewNotice(review) {
  return `Review ${review.level}: ${review.score}`;
}

function formatSignalLabel(signal) {
  return String(signal)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRiskLevel(level) {
  return level.toUpperCase();
}

function formatPromptStage(stage) {
  return `[${stage}]`;
}

function normalizeFilePath(path) {
  return path.replaceAll("\\", "/");
}

function normalizeSignalName(signal) {
  return signal.trim().toLowerCase().replaceAll(" ", "_");
}

function normalizeRiskScore(input) {
  if (typeof input === "number") {
    return { score: input };
  }

  return {
    score: input?.score ?? input?.riskScore ?? 0,
  };
}

function transformGraphNodes(nodes) {
  return nodes.map((node) => ({
    ...node,
    label: node.label ?? node.id,
  }));
}

function transformGraphEdges(edges) {
  return edges.map((edge) => ({
    ...edge,
    relation: edge.relation ?? "connectsTo",
  }));
}

function mapFindingsToCards(findings) {
  return findings.map((finding) => buildReviewFinding(finding.signal));
}

function reduceSignalsToClusters(signals) {
  return signals.reduce((clusters, signal) => {
    const key = signal.includes("hook") ? "react" : "general";
    return {
      ...clusters,
      [key]: [...(clusters[key] ?? []), signal],
    };
  }, {});
}

function sortFilesByRisk(files) {
  return [...files].sort((left, right) => {
    return getFileRiskScore(right) - getFileRiskScore(left);
  });
}

// -----------------------------------------------------------------------------
// IO-shaped functions
// Expected: io_heavy
// -----------------------------------------------------------------------------

async function fetchProjectGraph() {
  await Promise.resolve();
  return buildProjectGraph(buildMockFiles());
}

async function fetchFileContent(path) {
  await Promise.resolve();
  return `// Loaded ${path}`;
}

async function fetchReviewResult(file) {
  await Promise.resolve();
  return analyzeFileRisk(file);
}

async function fetchPromptChain(risk) {
  await Promise.resolve();
  return buildPromptChain(risk);
}

async function loadCachedAnalysis(path) {
  await Promise.resolve();
  return {
    path,
    cached: true,
  };
}

async function loadUserSettings() {
  await Promise.resolve();
  return createReviewConfig();
}

async function saveReviewResult(result) {
  await Promise.resolve();
  return {
    ok: true,
    result,
  };
}

async function savePromptChain(promptChain) {
  await Promise.resolve();
  return {
    ok: true,
    promptChain,
  };
}

async function sendReviewTelemetry(event) {
  await Promise.resolve();
  return {
    ok: true,
    event,
  };
}

async function postRefactorRequest(request) {
  await Promise.resolve();
  return {
    ok: true,
    request,
  };
}

// -----------------------------------------------------------------------------
// Orchestrator-shaped functions
// Expected: orchestrator_heavy
// -----------------------------------------------------------------------------

function runFullReview(files) {
  const projectRisk = analyzeProjectRisk(files);
  const targets = files.flatMap(analyzePromptTargets);
  const promptChain = buildPromptChain(projectRisk);

  return {
    ...projectRisk,
    targets,
    promptChain,
  };
}

function runFunctionProfileReview(file) {
  const profile = analyzeFunctionProfile(file);
  const risk = analyzeFileRisk(file);
  const plan = buildExtractionPlan(risk);

  return {
    profile,
    risk,
    plan,
  };
}

function runPromptChainBuild(risk) {
  const promptChain = buildPromptChain(risk);
  const stages = getPromptStages(promptChain);

  return {
    promptChain,
    stages,
  };
}

function executeReviewPipeline(files) {
  const review = runFullReview(files);
  const plan = buildExtractionPlan(review);

  return {
    review,
    plan,
  };
}

function executeExtractionPlan(file) {
  const review = runFunctionProfileReview(file);

  return {
    file,
    steps: review.plan.steps,
  };
}

function executePromptSequence(promptChain) {
  return getPromptStages(promptChain).map(formatPromptStage);
}

function applyReviewFindings(file, findings) {
  return {
    ...file,
    findings,
    reviewed: true,
  };
}

function applyFilterState(state, filters) {
  return {
    ...state,
    filters,
  };
}

function applySortState(state, sortBy) {
  return {
    ...state,
    filters: {
      ...state.filters,
      sortBy,
    },
  };
}

function applyRiskThresholds(files, thresholds) {
  return files.map((file) => ({
    ...file,
    level: getFileRiskScore(file) > thresholds.high ? "high" : "medium",
  }));
}

// -----------------------------------------------------------------------------
// Decision-heavy reducer
// Expected: complexity signals too
// -----------------------------------------------------------------------------

function dashboardReducer(state, action) {
  switch (action.type) {
    case "filesLoaded":
      return {
        ...state,
        files: action.files,
        notice: "Files loaded",
      };

    case "selectFile":
      return {
        ...state,
        selectedFile: action.file,
        notice: `Selected ${action.file.path}`,
      };

    case "analysisComplete":
      return {
        ...state,
        analysis: action.analysis,
        notice: "Analysis complete",
      };

    case "filtersReset":
      return {
        ...state,
        filters: INITIAL_FILTERS,
        notice: "Filters reset",
      };

    case "filterChanged":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.key]: action.value,
        },
      };

    case "sortChanged":
      return {
        ...state,
        filters: {
          ...state.filters,
          sortBy: action.value,
        },
      };

    case "riskToggled":
      return {
        ...state,
        selectedFile: action.file,
        notice: "Risk toggled",
      };

    case "promptRun":
      return {
        ...state,
        promptOpen: true,
        notice: "Prompt run",
      };

    case "clusterSelected":
      return {
        ...state,
        selectedCluster: action.cluster,
      };

    case "findingSelected":
      return {
        ...state,
        selectedFinding: action.finding,
      };

    case "dashboardReset":
      return INITIAL_STATE;

    case "projectRefreshRequested":
      return {
        ...state,
        notice: "Refresh requested",
      };

    case "zipUploaded":
      return {
        ...state,
        notice: "Zip uploaded",
      };

    case "debugOpened":
      return {
        ...state,
        debugOpen: true,
      };

    case "debugClosed":
      return {
        ...state,
        debugOpen: false,
      };

    case "togglePromptPanel":
      return {
        ...state,
        promptOpen: !state.promptOpen,
      };

    case "toggleDebugPanel":
      return {
        ...state,
        debugOpen: !state.debugOpen,
      };

    case "toggleClusterGroup":
      return {
        ...state,
        selectedCluster:
          state.selectedCluster === action.cluster ? null : action.cluster,
      };

    case "toggleRiskDetails":
      return {
        ...state,
        selectedFile: action.file,
      };

    default:
      return state;
  }
}