// Prompt Generator v2 Options
// This file defines all selectable configurations for prompt generation

// -----------------------------
// Task Intents
// -----------------------------

export const TASK_OPTIONS = [
  { value: "refactor", label: "Refactor" },
  { value: "analyze", label: "Analyze System" },
  { value: "explain", label: "Explain Architecture" },
  { value: "optimize", label: "Optimize Performance" },
  { value: "test", label: "Generate Tests" },
  { value: "extract", label: "Extract Modules" },
  { value: "review", label: "Code Review" },
];

// -----------------------------
// Target Architectures
// -----------------------------

export const TARGET_ARCHITECTURES = [
  {
    value: "pipeline",
    label: "Pipeline",
    description:
      "Linear sequence of named processing stages (build → transform → filter → finalize).",
  },
  {
    value: "service_layer",
    label: "Service Layer",
    description:
      "Separate business logic into service modules, keeping orchestration thin.",
  },
  {
    value: "state_machine",
    label: "State Machine / Reducer",
    description:
      "Model behavior as explicit states and transitions.",
  },
  {
    value: "component_composition",
    label: "Component Composition",
    description:
      "Break UI into small reusable components with clear responsibilities.",
  },
  {
    value: "adapter_orchestrator",
    label: "Adapter / Orchestrator",
    description:
      "Central orchestrator coordinates smaller adapters or handlers.",
  },
  {
    value: "tat_semantic_model",
    label: "TAT Semantic Model",
    description:
      "Represent logic as graph-based semantic relationships using TAT.",
  },
];

// -----------------------------
// Strictness Levels
// -----------------------------

export const STRICTNESS_OPTIONS = [
  {
    value: "behavior_preserving",
    label: "Behavior Preserving",
    description: "Do not change logic, thresholds, or outputs.",
  },
  {
    value: "moderate",
    label: "Moderate Refactor",
    description: "Allow small improvements but preserve core behavior.",
  },
  {
    value: "exploratory",
    label: "Exploratory Refactor",
    description: "Allow deeper restructuring and improvements.",
  },
];

// -----------------------------
// Output Formats
// -----------------------------

export const OUTPUT_FORMATS = [
  {
    value: "full_files",
    label: "Full Files",
    description: "Return complete updated files and extracted modules.",
  },
  {
    value: "diff",
    label: "Diff Style",
    description: "Show changes only (before/after).",
  },
  {
    value: "plan",
    label: "Refactor Plan",
    description: "Step-by-step plan without full code.",
  },
  {
    value: "explanation",
    label: "Explanation Only",
    description: "Explain structure without rewriting code.",
  },
];

// -----------------------------
// Risk Levels (derived or manual)
// -----------------------------

export const RISK_LEVELS = [
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

// -----------------------------
// Domain Context (optional but powerful)
// -----------------------------

export const DOMAIN_OPTIONS = [
  { value: "general", label: "General" },
  { value: "frontend", label: "Frontend UI" },
  { value: "backend", label: "Backend Services" },
  { value: "data_processing", label: "Data Processing" },
  { value: "audio", label: "Audio / Signal Processing" },
  { value: "ai", label: "AI / ML Systems" },
];

// -----------------------------
// Default Prompt Config
// -----------------------------

export const DEFAULT_PROMPT_CONFIG = {
  task: "refactor",
  targetArchitecture: "pipeline",
  strictness: "behavior_preserving",
  outputFormat: "full_files",
  riskLevel: "medium",
  domain: "general",
};