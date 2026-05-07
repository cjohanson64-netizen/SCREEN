import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  const healthData = useProjectHealth();
  const fileRisk = useFileRisk();
  const promptChain = usePromptChain();
  const reviewState = useReviewState();

  const visibleItems = useMemo(() => {
    return getVisibleItems(healthData.items, filterText);
  }, [healthData.items, filterText]);

  function handleTogglePanel() {
    setIsOpen((current) => !current);
  }

  function handleFilterChange(event) {
    setFilterText(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (hasHighRisk(fileRisk)) {
      analyzeRisk(fileRisk);
    }
  }

  return (
    <main>
      <Header />
      <FilterPanel
        filterText={filterText}
        onFilterChange={handleFilterChange}
        onSubmit={handleSubmit}
      />
      <ResultCard items={visibleItems} />
      <MetricCard risk={fileRisk} />
      <button onClick={handleTogglePanel}>
        {isOpen ? "Close" : "Open"}
      </button>
      {isOpen && <SidePanel promptChain={promptChain} reviewState={reviewState} />}
    </main>
  );
}

// -----------------------------
// Component-shaped functions
// Expected: componentCount >= 4
// -----------------------------

function Header() {
  return <h1>SCREEN Function Profile Test</h1>;
}

function FilterPanel({ filterText, onFilterChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <input value={filterText} onChange={onFilterChange} />
      <button type="submit">Analyze</button>
    </form>
  );
}

function ResultCard({ items }) {
  return (
    <section>
      <h2>Results</h2>
      {items.map((item) => (
        <p key={item.id}>{item.name}</p>
      ))}
    </section>
  );
}

function MetricCard({ risk }) {
  return (
    <aside>
      <strong>Risk:</strong> {risk.level}
    </aside>
  );
}

function SidePanel({ promptChain, reviewState }) {
  return (
    <aside>
      <h2>Prompt Chain</h2>
      <p>{promptChain.title}</p>
      <p>{reviewState.status}</p>
    </aside>
  );
}

// -----------------------------
// Hook-shaped functions
// Expected: hookCount >= 4
// Signal: hook_heavy
// Finding: functions.hooks_clustered
// -----------------------------

function useProjectHealth() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([
      { id: 1, name: "App.jsx", score: 82 },
      { id: 2, name: "Dashboard.jsx", score: 74 },
    ]);
  }, []);

  return { items };
}

function useFileRisk() {
  return {
    level: "medium",
    score: 62,
    factors: ["hook_heavy", "component_heavy"],
  };
}

function usePromptChain() {
  return {
    title: "Refactor hook-heavy component",
    stages: ["DISCOVER", "PLAN", "TRANSFORM", "VERIFY"],
  };
}

function useReviewState() {
  return {
    status: "ready",
    selectedSignal: "hook_heavy",
  };
}

// -----------------------------
// Getter-shaped functions
// Expected: getters >= 4
// Signal: getter_heavy
// Finding: functions.getters_clustered
// -----------------------------

function getVisibleItems(items, filterText) {
  return items.filter((item) => getItemName(item).includes(filterText));
}

function getItemName(item) {
  return item.name ?? "";
}

function getRiskScore(risk) {
  return risk.score ?? 0;
}

function getRiskLevel(risk) {
  return risk.level ?? "low";
}

// -----------------------------
// Predicate-shaped functions
// Expected: predicates >= 4
// Signal: predicate_heavy
// Finding: functions.predicates_clustered
// -----------------------------

function hasHighRisk(risk) {
  return getRiskScore(risk) > 70;
}

function isRefactorCandidate(risk) {
  return getRiskScore(risk) > 50;
}

function canExtractSafely(file) {
  return file.imports.length < 10;
}

function shouldSplitModule(file) {
  return file.lineCount > 300 || file.functionCount > 12;
}

// -----------------------------
// Analyzer-shaped functions
// Expected: analyzers >= 3
// Signal: analyzer_heavy
// Finding: functions.analyzers_clustered
// -----------------------------

function analyzeFile(file) {
  return {
    lineCount: file.content.split("\n").length,
    functionCount: detectFunctionNames(file.content).length,
  };
}

function analyzeRisk(risk) {
  if (hasHighRisk(risk)) {
    return "high";
  }

  if (isRefactorCandidate(risk)) {
    return "medium";
  }

  return "low";
}

function detectFunctionNames(code) {
  return code.match(/\bfunction\s+[A-Za-z_$][\w$]*/g) ?? [];
}

// -----------------------------
// Handler-shaped functions
// Expected: handlers >= 4
// Signal: handler_heavy
// Finding: functions.handlers_clustered
// -----------------------------

function handleAnalyzeClick(file) {
  return analyzeFile(file);
}

function handleRiskClick(risk) {
  return analyzeRisk(risk);
}

function handleCopyPrompt(prompt) {
  navigator.clipboard.writeText(prompt);
}

function toggleDebugPanel(isOpen) {
  return !isOpen;
}