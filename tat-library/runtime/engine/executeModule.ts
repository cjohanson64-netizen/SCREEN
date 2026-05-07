import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  ProgramNode,
  ProjectionDefNode,
} from "../../ast/nodeTypes.js";
import { parse } from "../../parser/parse.js";
import { tokenize } from "../../lexer/tokenize.js";
import {
  executeProgram,
  type RuntimeAssetKind,
  type RuntimeState,
  type InjectionRegistry,
} from "./executeProgram.js";
import {
  createActionRegistry,
  registerAction,
  type RuntimeAction,
} from "./actionRegistry.js";
import {
  cloneGraph,
  type Graph,
  type GraphNode,
  type GraphValue,
} from "../graph/graph.js";
import {
  createRuntimeBindings,
  registerNodeBinding,
  registerValueBinding,
} from "../query/evaluateNodeCapture.js";
import type { GraphInteraction } from "../graph/executeGraphInteraction.js";
import { createRuntimeTimingCollector, measureTiming, type RuntimeTimingCollector, type RuntimeTimingReport } from "../instrumentation/timing.js";
import { createRuntimeProfiler, type RuntimeProfiler, type RuntimeProfileReport } from "../instrumentation/profiler.js";
import {
  recordParseCacheHit,
  recordParseCacheMiss,
  resolveRuntimeParseCache,
  type RuntimeParseCache,
} from "../cache/parseCache.js";
import {
  resolveRuntimeInjectionFragmentCache,
  type RuntimeInjectionFragmentCache,
} from "../cache/injectionFragmentCache.js";

export interface ModuleAsset {
  kind: RuntimeAssetKind;
  value: GraphNode | Graph | RuntimeAction | GraphInteraction | unknown;
}

export interface LoadedModule {
  path: string;
  source: string;
  ast: ProgramNode;
  state: RuntimeState;
  exports: Map<string, ModuleAsset>;
  timing?: RuntimeTimingReport;
  profile?: RuntimeProfileReport;
}

export interface ExecuteTatModuleOptions {
  timing?: boolean;
  profile?: boolean;
  parseCache?: boolean | RuntimeParseCache;
  injectionFragmentCache?: boolean | RuntimeInjectionFragmentCache;
  injections?: InjectionRegistry;
}

export function executeTatModule(
  entryPath: string,
  options: ExecuteTatModuleOptions = {},
): LoadedModule {
  const cache = new Map<string, LoadedModule>();
  const loading = new Set<string>();
  const normalizedEntry = normalizePath(entryPath);
  const timing = options.timing || options.profile ? createRuntimeTimingCollector() : undefined;
  const profiler = options.profile ? createRuntimeProfiler() : undefined;
  const parseCache = resolveRuntimeParseCache(options.parseCache);
  const injectionFragmentCache = resolveRuntimeInjectionFragmentCache(options.injectionFragmentCache);
  const loaded = loadModule(normalizedEntry, cache, loading, timing, profiler, parseCache, injectionFragmentCache, options.injections);
  return {
    ...loaded,
    ...(timing ? { timing: timing.report() } : {}),
    ...(profiler ? { profile: profiler.report() } : {}),
  };
}

function loadModule(
  filePath: string,
  cache: Map<string, LoadedModule>,
  loading: Set<string>,
  timing?: RuntimeTimingCollector,
  profiler?: RuntimeProfiler,
  parseCache?: RuntimeParseCache,
  injectionFragmentCache?: RuntimeInjectionFragmentCache,
  injections?: InjectionRegistry,
): LoadedModule {
  const normalizedPath = normalizePath(filePath);
  const cached = cache.get(normalizedPath);
  if (cached) {
    return cached;
  }

  if (loading.has(normalizedPath)) {
    throw new Error(`Circular module import detected: ${normalizedPath}`);
  }

  if (!existsSync(normalizedPath)) {
    throw new Error(`Unresolved import path: ${normalizedPath}`);
  }

  loading.add(normalizedPath);
  try {
    const source = measureTiming(timing, "readSource", () => readFileSync(normalizedPath, "utf8"));
    const ast = parseModuleSource(normalizedPath, source, timing, parseCache);

    const initialState = measureTiming(timing, "resolveImports", () =>
      createImportedInitialState(ast, normalizedPath, cache, loading, timing, profiler, parseCache, injectionFragmentCache, injections),
    );
    const execution = executeProgram(ast, {
      initialState,
      injections: injections ?? initialState.injections,
      timingCollector: timing,
      profiler,
      injectionFragmentCache,
    });

    const exportedNames = collectExportNames(ast);
    const exports = new Map<string, ModuleAsset>();

    for (const exportName of exportedNames) {
      const asset = resolveExportAsset(exportName, execution.state);
      if (!asset) {
        throw new Error(`Invalid export reference "${exportName}" in module ${normalizedPath}`);
      }
      exports.set(exportName, asset);
    }

    const loaded: LoadedModule = {
      path: normalizedPath,
      source,
      ast,
      state: execution.state,
      exports,
    };

    cache.set(normalizedPath, loaded);
    return loaded;
  } finally {
    loading.delete(normalizedPath);
  }
}

function parseModuleSource(
  filePath: string,
  source: string,
  timing?: RuntimeTimingCollector,
  parseCache?: RuntimeParseCache,
): ProgramNode {
  const cached = parseCache?.get(filePath, source);

  if (cached) {
    recordParseCacheHit(timing);
    return cached.ast;
  }

  recordParseCacheMiss(timing);
  const tokens = measureTiming(timing, "tokenize", () => tokenize(source));
  const ast = measureTiming(timing, "parseRoot", () => parse(tokens));
  parseCache?.set(filePath, source, ast, tokens);
  return ast;
}

function createImportedInitialState(
  ast: ProgramNode,
  containingFile: string,
  cache: Map<string, LoadedModule>,
  loading: Set<string>,
  timing?: RuntimeTimingCollector,
  profiler?: RuntimeProfiler,
  parseCache?: RuntimeParseCache,
  injectionFragmentCache?: RuntimeInjectionFragmentCache,
  injections?: InjectionRegistry,
): Partial<RuntimeState> {
  const bindings = createRuntimeBindings();
  const actions = createActionRegistry();
  const assetKinds = new Map<string, RuntimeAssetKind>();
  const graphs = new Map<string, Graph>();
  const projectionDefinitions = new Map<string, ProjectionDefNode>();
  const projections = new Map<string, unknown>();
  const graphInteractions = new Map<string, GraphInteraction>();

  for (const statement of ast.body) {
    if (statement.type !== "ImportDeclaration") {
      continue;
    }

    const modulePath = resolveImportPath(statement.source.value, containingFile);
    const importedModule = loadModule(modulePath, cache, loading, timing, profiler, parseCache, injectionFragmentCache, injections);

    for (const specifier of statement.specifiers) {
      const importedName = specifier.imported.name;
      const localName = specifier.local.name;
      const asset = importedModule.exports.get(importedName);

      if (!asset) {
        throw new Error(
          `Unresolved imported symbol "${importedName}" from ${modulePath}`,
        );
      }

      assetKinds.set(localName, asset.kind);

      switch (asset.kind) {
        case "node":
          registerNodeBinding(bindings, localName, cloneGraphNode(asset.value as GraphNode));
          break;

        case "graph":
        case "fragment":
          graphs.set(localName, cloneGraph(asset.value as Graph));
          break;

        case "projection":
          if (isProjectionDefinitionAsset(asset.value)) {
            projectionDefinitions.set(localName, structuredCloneSafe(asset.value));
          } else {
            projections.set(localName, structuredCloneSafe(asset.value));
          }
          break;

        case "program":
          registerAction(actions, {
            ...(asset.value as RuntimeAction),
            bindingName: localName,
          });
          break;

        case "interaction":
          graphInteractions.set(localName, structuredCloneSafe(asset.value) as GraphInteraction);
          break;

        case "value":
          registerValueBinding(bindings, localName, structuredCloneSafe(asset.value) as any);
          break;

        default: {
          const _exhaustive: never = asset.kind;
          throw new Error(`Unsupported imported asset kind: ${_exhaustive}`);
        }
      }
    }
  }

  return {
    bindings,
    actions,
    assetKinds,
    graphs,
    projectionDefinitions,
    projections,
    graphInteractions,
    interactionHistory: [],
    injections,
    injectionFragmentCache,
  };
}

function collectExportNames(ast: ProgramNode): string[] {
  const names: string[] = [];
  for (const statement of ast.body) {
    if (statement.type !== "ExportDeclaration") {
      continue;
    }
    for (const specifier of statement.specifiers) {
      names.push(specifier.local.name);
    }
  }
  return names;
}

function resolveExportAsset(
  name: string,
  state: RuntimeState,
): ModuleAsset | null {
  const kind = state.assetKinds.get(name);
  if (!kind) {
    return null;
  }

  switch (kind) {
    case "node": {
      const node = state.bindings.nodes.get(name);
      if (!node) return null;
      return { kind, value: cloneGraphNode(node) };
    }

    case "graph":
    case "fragment": {
      const graph = state.graphs.get(name);
      if (!graph) return null;
      return { kind, value: cloneGraph(graph) };
    }

    case "projection": {
      const projectionDefinition = state.projectionDefinitions.get(name);
      if (projectionDefinition) {
        return { kind, value: structuredCloneSafe(projectionDefinition) };
      }
      const projection = state.projections.get(name);
      if (projection === undefined) return null;
      return { kind, value: structuredCloneSafe(projection) };
    }

    case "program": {
      const action = state.actions.get(name);
      if (!action) return null;
      return { kind, value: structuredCloneSafe(action) };
    }

    case "interaction": {
      const interaction = state.graphInteractions.get(name);
      if (!interaction) return null;
      return { kind, value: structuredCloneSafe(interaction) };
    }

    case "value": {
      const value = state.bindings.values.get(name);
      if (value === undefined) return null;
      return { kind, value: structuredCloneSafe(value) };
    }

    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unsupported export kind: ${_exhaustive}`);
    }
  }
}

function resolveImportPath(specifier: string, containingFile: string): string {
  const fromDir = path.dirname(containingFile);
  const rawPath = path.resolve(fromDir, specifier);

  if (existsSync(rawPath)) {
    return normalizePath(rawPath);
  }

  const withTat = `${rawPath}.tat`;
  if (existsSync(withTat)) {
    return normalizePath(withTat);
  }

  throw new Error(`Unresolved import path: ${specifier}`);
}

function normalizePath(value: string): string {
  return path.resolve(value);
}

function cloneGraphNode(node: GraphNode): GraphNode {
  return {
    id: node.id,
    value: deepClone(node.value),
    state: deepCloneRecord(node.state),
    meta: deepCloneRecord(node.meta),
  };
}

function deepClone<T extends GraphValue>(value: T): T {
  if (value === null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (typeof value === "object") {
    const out: Record<string, GraphValue> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = deepClone(v);
    }
    return out as T;
  }

  return value;
}

function deepCloneRecord<T extends Record<string, GraphValue>>(record: T): T {
  const out: Record<string, GraphValue> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = deepClone(value);
  }
  return out as T;
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function isProjectionDefinitionAsset(value: unknown): value is ProjectionDefNode {
  return !!value && typeof value === "object" && (value as { type?: string }).type === "ProjectionDef";
}
