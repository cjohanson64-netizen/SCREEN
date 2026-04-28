import type { ProjectExprNode, ValueExprNode } from "../../ast/nodeTypes.js";
import type { RuntimeState } from "../executeProgram.js";
import type { RuntimeBindings } from "../evaluateNodeCapture.js";
import type { ActionRegistry } from "../actionRegistry.js";
import type { Graph } from "../graph.js";
import { evaluateValueExpr } from "../evaluateNodeCapture.js";
import type { ProjectSpec } from "./projectTypes.js";
import {
  fullIncludeSet,
  isProjectFormat,
  isProjectIncludeKey,
  PROJECT_FORMAT_RULES,
  type ProjectFormat,
  type ProjectIncludeKey,
} from "./projectFormatRules.js";

export function resolveProjectSpec(
  graph: Graph,
  projection: ProjectExprNode | null,
  state: Pick<RuntimeState, "bindings" | "actions">,
): ProjectSpec {
  if (!projection) {
    if (!graph.root) {
      throw new Error(
        `@project could not determine a focus node because the graph has no root`,
      );
    }

    return {
      format: "graph",
      focus: graph.root,
      include: fullIncludeSet("graph"),
      depth: null,
    };
  }

  const formatArg = getProjectArgument(projection, "format");
  if (!formatArg) {
    throw new Error(`@project requires a format field`);
  }

  const formatValue = evaluateValueExpr(
    formatArg.value,
    state.bindings,
    state.actions,
  );
  if (typeof formatValue !== "string") {
    throw new Error(`@project format must resolve to a string`);
  }
  if (!isProjectFormat(formatValue)) {
    throw new Error(`Invalid @project format "${formatValue}"`);
  }

  const focusArg = getProjectArgument(projection, "focus");
  const includeArg = getProjectArgument(projection, "include");

  if (projection.syntax === "block") {
    if (!focusArg) {
      throw new Error(`@project requires a focus field`);
    }
    if (!includeArg) {
      throw new Error(`@project requires an include field`);
    }
  }

  const focus = focusArg
    ? resolveFocusNodeId(focusArg.value, graph, state.bindings, state.actions)
    : graph.root;

  if (!focus) {
    throw new Error(`@project could not determine a focus node`);
  }

  if (!graph.nodes.has(focus)) {
    throw new Error(
      `@project focus "${focus}" does not resolve to a node in the graph`,
    );
  }

  const include = includeArg
    ? resolveProjectInclude(
        includeArg.value,
        formatValue,
        state.bindings,
        state.actions,
      )
    : fullIncludeSet(formatValue);
  const depthArg = getProjectArgument(projection, "depth");
  const depthValue = depthArg
    ? evaluateValueExpr(depthArg.value, state.bindings, state.actions)
    : null;

  if (
    depthValue !== null &&
    (typeof depthValue !== "number" ||
      !Number.isInteger(depthValue) ||
      depthValue < 1)
  ) {
    throw new Error(`@project depth must resolve to an integer >= 1`);
  }

  return {
    format: formatValue,
    focus,
    include,
    depth: depthValue,
  };
}

export function getProjectArgument(
  projection: ProjectExprNode,
  key: string,
): {
  key: ProjectExprNode["args"][number]["key"];
  value: ValueExprNode;
} | null {
  return projection.args.find((arg) => arg.key && arg.key.name === key) ?? null;
}

function resolveProjectInclude(
  expr: ValueExprNode,
  format: ProjectFormat,
  bindings: RuntimeBindings,
  actions: ActionRegistry,
): ProjectIncludeKey[] {
  const value = evaluateValueExpr(expr, bindings, actions);
  if (!Array.isArray(value)) {
    throw new Error(`@project include must resolve to an array`);
  }

  const include: ProjectIncludeKey[] = [];
  const seen = new Set<ProjectIncludeKey>();
  const rule = PROJECT_FORMAT_RULES[format];
  const allowed = new Set<ProjectIncludeKey>([...rule.core, ...rule.allowed]);

  for (const entry of value) {
    if (typeof entry !== "string") {
      throw new Error(`@project include entries must resolve to strings`);
    }
    if (!isProjectIncludeKey(entry)) {
      throw new Error(`Invalid @project include key "${entry}"`);
    }
    if (!allowed.has(entry)) {
      throw new Error(
        `@project format "${format}" does not allow include key "${entry}"`,
      );
    }
    if (!seen.has(entry)) {
      include.push(entry);
      seen.add(entry);
    }
  }

  for (const required of rule.core) {
    if (!seen.has(required)) {
      throw new Error(
        `@project format "${format}" requires include key "${required}"`,
      );
    }
  }

  return include;
}

function resolveFocusNodeId(
  expr: ValueExprNode,
  graph: Graph,
  bindings: RuntimeBindings,
  actions: ActionRegistry,
): string {
  if (expr.type === "Identifier" && bindings.nodes.has(expr.name)) {
    return bindings.nodes.get(expr.name)!.id;
  }

  const value = evaluateValueExpr(expr, bindings, actions);
  if (typeof value !== "string") {
    throw new Error(`@project focus must resolve to a node reference`);
  }

  if (bindings.nodes.has(value)) {
    return bindings.nodes.get(value)!.id;
  }

  if (!graph.nodes.has(value)) {
    throw new Error(
      `@project focus "${value}" does not resolve to a node in the graph`,
    );
  }

  return value;
}
