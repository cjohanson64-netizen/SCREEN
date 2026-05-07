const isOpen = true;
const hasHighRisk = score > 80;
const canExtractHooks = file.hookCount > 3;
const shouldBlockFeatureWork = hasHighRisk && file.complexity > 70;
const willRunReview = true;
const needsRefactor = true;
const requiresManualReview = true;
const allowsAutoFix = false;
const enableDebugMode = true;
const disabledPromptChain = false;
const showRiskPanel = true;
const hideLowRiskFiles = false;
const visibleClusterCount = 4;
const selectedFilePath = "src/App.jsx";
const activeTab = "metrics";
const loadingState = false;
const errorMessage = "";

const MAX_COMPLEXITY = 100;
const MIN_CONFIDENCE = 0.7;
const RISK_THRESHOLD = 80;
const DEFAULT_SORT = "risk";
const TIMEOUT_DURATION = 3000;

function Example() {
  return null;
}