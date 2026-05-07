import { useEffect, useMemo, useReducer, useState } from "react";

// Mega SCREEN function-profile stress test
// This file is intentionally oversized and over-clustered.
// It is not meant to be beautiful app code.
// It is meant to trigger SCREEN's semantic function-profile layer.

const INITIAL_FILTERS = {
  text: "",
  risk: "",
  owner: "",
  status: "",
  category: "",
  sort: "",
  direction: "",
};

const INITIAL_STATE = {
  files: [],
  selectedFile: null,
  filters: INITIAL_FILTERS,
  debugOpen: false,
  promptOpen: false,
  lastAnalysis: null,
};

export default function MegaDashboard() {
  const [state, dispatch] = useReducer(dashboardReducer, INITIAL_STATE);
  const [notice, setNotice] = useState('Ready');
  const projectHealth = useProjectHealthModel();
  const fileRisk = useFileRiskModel(projectHealth.files);
  const promptChain = usePromptChainModel(fileRisk);
  const semanticReview = useSemanticReviewModel(fileRisk);
  const filteredFiles = useMemo(() => {
    return getVisibleFiles(projectHealth.files, state.filters);
  }, [projectHealth.files, state.filters]);
  useEffect(() => {
    dispatch({ type: 'filesLoaded', files: projectHealth.files });
  }, [projectHealth.files]);
  function handleSelectFile(file) {
    dispatch({ type: 'selectFile', file });
  }
  function handleRunReview() {
    const review = analyzeProjectRisk(projectHealth.files);
    setNotice(formatReviewNotice(review));
    dispatch({ type: 'analysisComplete', analysis: review });
  }
  function handleResetFilters() {
    dispatch({ type: 'filtersReset' });
  }
  return (
    <main className="mega-dashboard">
      <MegaHeader notice={notice} onRunReview={handleRunReview} />
      <MegaToolbar filters={state.filters} dispatch={dispatch} onReset={handleResetFilters} />
      <DashboardSummary files={filteredFiles} risk={fileRisk} />
      <FileList files={filteredFiles} onSelectFile={handleSelectFile} />
      <ReviewWorkspace state={state} risk={fileRisk} promptChain={promptChain} semanticReview={semanticReview} />
    </main>
  );
}

// -----------------------------
// Component-shaped functions
// Expected: component_heavy
// -----------------------------

function MegaHeader(props) {
  const title = props.title ?? 'MegaHeader';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="MegaHeader">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function MegaToolbar(props) {
  const title = props.title ?? 'MegaToolbar';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="MegaToolbar">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function DashboardSummary(props) {
  const title = props.title ?? 'DashboardSummary';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="DashboardSummary">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function FileList(props) {
  const title = props.title ?? 'FileList';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="FileList">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function FileRow(props) {
  const title = props.title ?? 'FileRow';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="FileRow">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function ReviewWorkspace(props) {
  const title = props.title ?? 'ReviewWorkspace';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="ReviewWorkspace">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function RiskPanel(props) {
  const title = props.title ?? 'RiskPanel';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="RiskPanel">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function PromptPanel(props) {
  const title = props.title ?? 'PromptPanel';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="PromptPanel">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function SemanticPanel(props) {
  const title = props.title ?? 'SemanticPanel';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="SemanticPanel">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function DebugPanel(props) {
  const title = props.title ?? 'DebugPanel';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="DebugPanel">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function MetricTile(props) {
  const title = props.title ?? 'MetricTile';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="MetricTile">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function SignalBadge(props) {
  const title = props.title ?? 'SignalBadge';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="SignalBadge">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function FindingCard(props) {
  const title = props.title ?? 'FindingCard';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="FindingCard">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function ClusterCard(props) {
  const title = props.title ?? 'ClusterCard';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="ClusterCard">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function ActionBar(props) {
  const title = props.title ?? 'ActionBar';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="ActionBar">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function EmptyState(props) {
  const title = props.title ?? 'EmptyState';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="EmptyState">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function LoadingState(props) {
  const title = props.title ?? 'LoadingState';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="LoadingState">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function ErrorState(props) {
  const title = props.title ?? 'ErrorState';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="ErrorState">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function FilterGroup(props) {
  const title = props.title ?? 'FilterGroup';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="FilterGroup">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

function SortMenu(props) {
  const title = props.title ?? 'SortMenu';
  const items = props.items ?? props.files ?? [];
  const count = Array.isArray(items) ? items.length : 0;
  const detail = props.detail ?? `${title}: ${count}`;
  return (
    <section className="SortMenu">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}

// -----------------------------
// Hook-shaped functions
// Expected: hook_heavy
// -----------------------------

function useProjectHealthModel() {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useFileRiskModel(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function usePromptChainModel(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useSemanticReviewModel(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useFileSelection(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useFilterState(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useRiskThresholds(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useAnalysisHistory(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useKeyboardShortcuts(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useReviewNotice(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function useProjectGraph(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

function usePromptPreview(input) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(buildDefaultModel(input));
  }, [input]);
  return value ?? buildDefaultModel(input);
}

// -----------------------------
// Getter-shaped functions
// Expected: getter_heavy
// -----------------------------

function getVisibleFiles(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getFileRiskScore(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getFileRiskLevel(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getDominantSignal(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getClusterNames(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getPromptStages(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getFindingSummary(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getSortedFiles(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getFilteredFiles(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getOwnerName(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getStatusLabel(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getCategoryLabel(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getLineCount(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getFunctionCount(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getHookCount(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

function getComponentCount(input, options = {}) {
  const source = Array.isArray(input) ? input : input?.items ?? [];
  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }
  return input?.value ?? input?.score ?? options.fallback ?? 0;
}

// -----------------------------
// Predicate-shaped functions
// Expected: predicate_heavy
// -----------------------------

function hasHighRisk(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function hasMediumRisk(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function hasManyHooks(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function hasManyComponents(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function hasAnalyzerCluster(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function hasHandlerCluster(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function isRefactorCandidate(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function isReviewableFile(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function isFrontendFile(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function isBackendFile(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function canExtractHooks(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function canSplitComponents(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function shouldCreateService(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function shouldCreateAnalyzerModule(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function shouldReduceNesting(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function shouldExtractPredicates(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function shouldGeneratePrompt(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

function shouldBlockFeatureWork(file, metrics = {}) {
  const score = metrics.score ?? file?.riskScore ?? 0;
  const count = metrics.count ?? file?.functionCount ?? 0;
  return score > 50 || count > 8;
}

// -----------------------------
// Analyzer-shaped functions
// Expected: analyzer_heavy
// -----------------------------

function analyzeProjectRisk(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeProjectRisk',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeFileRisk(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeFileRisk',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeFunctionProfile(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeFunctionProfile',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeComponentDensity(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeComponentDensity',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeHookDensity(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeHookDensity',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzePredicateDensity(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzePredicateDensity',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeHandlerDensity(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeHandlerDensity',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeImportPressure(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeImportPressure',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzeDependencyShape(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzeDependencyShape',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function analyzePromptTargets(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'analyzePromptTargets',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectFunctionNames(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectFunctionNames',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectComponentNames(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectComponentNames',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectHookNames(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectHookNames',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectPredicateNames(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectPredicateNames',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectHandlerNames(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectHandlerNames',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectAnalyzerNames(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectAnalyzerNames',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectRiskClusters(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectRiskClusters',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

function detectExtractionTargets(input) {
  const items = Array.isArray(input) ? input : input?.files ?? [];
  const score = items.reduce((total, item) => total + (item.riskScore ?? 1), 0);
  return {
    type: 'detectExtractionTargets',
    count: items.length,
    score,
    status: score > 100 ? 'high' : 'medium',
  };
}

// -----------------------------
// Handler-shaped functions
// Expected: handler_heavy
// -----------------------------

function handleFileClick(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleFileClick', value });
  return value;
}

function handleFilterChange(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleFilterChange', value });
  return value;
}

function handleSortChange(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleSortChange', value });
  return value;
}

function handleRiskToggle(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleRiskToggle', value });
  return value;
}

function handlePromptCopy(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handlePromptCopy', value });
  return value;
}

function handlePromptRun(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handlePromptRun', value });
  return value;
}

function handleClusterClick(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleClusterClick', value });
  return value;
}

function handleFindingClick(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleFindingClick', value });
  return value;
}

function handleResetDashboard(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleResetDashboard', value });
  return value;
}

function handleRefreshProject(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleRefreshProject', value });
  return value;
}

function handleUploadZip(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleUploadZip', value });
  return value;
}

function handleDownloadReport(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleDownloadReport', value });
  return value;
}

function handleOpenDebug(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleOpenDebug', value });
  return value;
}

function handleCloseDebug(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'handleCloseDebug', value });
  return value;
}

function togglePromptPanel(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'togglePromptPanel', value });
  return value;
}

function toggleDebugPanel(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'toggleDebugPanel', value });
  return value;
}

function toggleClusterGroup(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'toggleClusterGroup', value });
  return value;
}

function toggleRiskDetails(eventOrValue, dispatch = () => {}) {
  const value = eventOrValue?.target?.value ?? eventOrValue;
  dispatch({ type: 'toggleRiskDetails', value });
  return value;
}

// -----------------------------
// Builder-shaped functions
// Expected: builder_heavy
// -----------------------------

function buildDefaultModel(input = {}) {
  return {
    kind: 'buildDefaultModel',
    input,
    createdAt: Date.now(),
  };
}

function buildRiskSummary(input = {}) {
  return {
    kind: 'buildRiskSummary',
    input,
    createdAt: Date.now(),
  };
}

function buildPromptChain(input = {}) {
  return {
    kind: 'buildPromptChain',
    input,
    createdAt: Date.now(),
  };
}

function buildReviewFinding(input = {}) {
  return {
    kind: 'buildReviewFinding',
    input,
    createdAt: Date.now(),
  };
}

function buildSignalCluster(input = {}) {
  return {
    kind: 'buildSignalCluster',
    input,
    createdAt: Date.now(),
  };
}

function buildMetricTiles(input = {}) {
  return {
    kind: 'buildMetricTiles',
    input,
    createdAt: Date.now(),
  };
}

function buildProjectGraph(input = {}) {
  return {
    kind: 'buildProjectGraph',
    input,
    createdAt: Date.now(),
  };
}

function buildFileNode(input = {}) {
  return {
    kind: 'buildFileNode',
    input,
    createdAt: Date.now(),
  };
}

function buildDependencyEdge(input = {}) {
  return {
    kind: 'buildDependencyEdge',
    input,
    createdAt: Date.now(),
  };
}

function buildExtractionPlan(input = {}) {
  return {
    kind: 'buildExtractionPlan',
    input,
    createdAt: Date.now(),
  };
}

function createReviewConfig(input = {}) {
  return {
    kind: 'createReviewConfig',
    input,
    createdAt: Date.now(),
  };
}

function createPromptConfig(input = {}) {
  return {
    kind: 'createPromptConfig',
    input,
    createdAt: Date.now(),
  };
}

function createRiskThresholds(input = {}) {
  return {
    kind: 'createRiskThresholds',
    input,
    createdAt: Date.now(),
  };
}

function createEmptyAnalysis(input = {}) {
  return {
    kind: 'createEmptyAnalysis',
    input,
    createdAt: Date.now(),
  };
}

// -----------------------------
// Transformer-shaped functions
// Expected: transformer_heavy
// -----------------------------

function parseReviewPayload(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function parseMetricsPayload(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function formatReviewNotice(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function formatSignalLabel(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function formatRiskLevel(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function formatPromptStage(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function normalizeFilePath(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function normalizeSignalName(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function normalizeRiskScore(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function transformGraphNodes(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function transformGraphEdges(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function mapFindingsToCards(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function reduceSignalsToClusters(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

function sortFilesByRisk(input) {
  if (Array.isArray(input)) {
    return input.map((item) => ({ ...item }));
  }
  if (typeof input === 'string') {
    return input.trim().replaceAll('_', ' ');
  }
  return input ?? null;
}

// -----------------------------
// IO-shaped functions
// Expected: io_heavy
// -----------------------------

async function fetchProjectGraph(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function fetchFileContent(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function fetchReviewResult(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function fetchPromptChain(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function loadCachedAnalysis(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function loadUserSettings(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function saveReviewResult(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function savePromptChain(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function sendReviewTelemetry(input) {
  await Promise.resolve();
  return { ok: true, input };
}

async function postRefactorRequest(input) {
  await Promise.resolve();
  return { ok: true, input };
}

// -----------------------------
// Orchestrator-shaped functions
// Expected: orchestrator_heavy
// -----------------------------

function runFullReview(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function runFunctionProfileReview(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function runPromptChainBuild(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function executeReviewPipeline(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function executeExtractionPlan(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function executePromptSequence(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function applyReviewFindings(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function applyFilterState(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function applySortState(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

function applyRiskThresholds(input) {
  const normalized = normalizeRiskScore(input);
  const analysis = analyzeFileRisk(normalized);
  const plan = buildExtractionPlan(analysis);
  return { normalized, analysis, plan };
}

// -----------------------------
// Reducer / decision-heavy logic
// Expected: complexity-related signals
// -----------------------------

function dashboardReducer(state, action) {
  switch (action.type) {
    case 'filesLoaded':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'selectFile':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'analysisComplete':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'filtersReset':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleFilterChange':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleSortChange':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'togglePromptPanel':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'toggleDebugPanel':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleFileClick':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleRiskToggle':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handlePromptRun':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleClusterClick':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleFindingClick':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleResetDashboard':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleRefreshProject':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleUploadZip':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    case 'handleDownloadReport':
      return {
        ...state,
        lastAction: action.type,
        lastPayload: action.value ?? action.file ?? action.files ?? null,
      };
    default:
      return state;
  }
}