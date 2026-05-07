export const PROJECT_FORMATS = [
  "graph",
  "detail",
  "tree",
  "relationships",
  "timeline",
  "trace",
  "summary",
  "collection",
] as const;

export type ProjectFormat = (typeof PROJECT_FORMATS)[number];

export const PROJECT_INCLUDE_KEYS = [
  "id",
  "step",
  "from",
  "to",
  "raw",
  "label",
  "type",
  "value",
  "state",
  "meta",
  "relationships",
  "children",
  "events",
  "actions",
  "action",
  "target",
  "event",
  "status",
  "counts",
] as const;

export type ProjectIncludeKey = (typeof PROJECT_INCLUDE_KEYS)[number];

type ProjectContractKey =
  | "nodes"
  | "node"
  | "items"
  | "tree"
  | "events"
  | "data";

interface ProjectFormatRule {
  core: ProjectIncludeKey[];
  allowed: ProjectIncludeKey[];
  contractKey: ProjectContractKey;
}

export const PROJECT_FORMAT_RULES: Record<ProjectFormat, ProjectFormatRule> = {
  graph: {
    core: ["id", "type", "value", "state", "meta", "relationships"],
    allowed: ["label", "status"],
    contractKey: "nodes",
  },
  detail: {
    core: ["id", "label", "type", "state", "meta"],
    allowed: ["value", "relationships", "actions", "status", "events"],
    contractKey: "node",
  },
  tree: {
    core: ["label", "children"],
    allowed: ["id", "type", "value", "state", "status", "meta"],
    contractKey: "tree",
  },
  relationships: {
    core: ["id", "label", "value", "state", "meta"],
    allowed: ["type", "status"],
    contractKey: "data",
  },
  timeline: {
    core: ["events"],
    allowed: [
      "id",
      "step",
      "from",
      "event",
      "action",
      "target",
      "label",
      "status",
      "state",
      "meta",
      "raw",
    ],
    contractKey: "events",
  },
  trace: {
    core: ["events"],
    allowed: [
      "id",
      "step",
      "from",
      "to",
      "event",
      "action",
      "target",
      "status",
      "state",
      "meta",
      "label",
      "raw",
    ],
    contractKey: "events",
  },
  summary: {
    core: ["label", "status"],
    allowed: ["id", "value", "state", "meta", "actions", "counts"],
    contractKey: "data",
  },
  collection: {
    core: ["id", "label"],
    allowed: [
      "type",
      "status",
      "value",
      "state",
      "meta",
      "action",
      "target",
      "event",
    ],
    contractKey: "items",
  },
};

export function isProjectFormat(value: string): value is ProjectFormat {
  return (PROJECT_FORMATS as readonly string[]).includes(value);
}

export function isProjectIncludeKey(value: string): value is ProjectIncludeKey {
  return (PROJECT_INCLUDE_KEYS as readonly string[]).includes(value);
}

export function fullIncludeSet(format: ProjectFormat): ProjectIncludeKey[] {
  const rule = PROJECT_FORMAT_RULES[format];
  return [...rule.core, ...rule.allowed];
}
