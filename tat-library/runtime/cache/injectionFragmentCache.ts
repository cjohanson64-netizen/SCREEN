import type { GraphPipelineStepNode, ProgramNode } from "../../ast/nodeTypes.js";
import type { RuntimeTimingCollector } from "../instrumentation/timing.js";

export type InjectionContextKind = "topLevel" | "graphPipeline";

export type CachedInjectionFragment =
  | {
      contextKind: "topLevel";
      hookRef: string;
      fileExtension: string;
      sourceHash: string;
      program: ProgramNode;
      createdAt: number;
      lastAccessedAt: number;
      hits: number;
    }
  | {
      contextKind: "graphPipeline";
      hookRef: string;
      fileExtension: string;
      sourceHash: string;
      steps: GraphPipelineStepNode[];
      createdAt: number;
      lastAccessedAt: number;
      hits: number;
    };

export interface RuntimeInjectionFragmentCacheStats {
  entries: number;
  hits: number;
  misses: number;
}

export class RuntimeInjectionFragmentCache {
  private readonly entries = new Map<string, CachedInjectionFragment>();
  private hitCount = 0;
  private missCount = 0;

  getTopLevel(
    hookRef: string,
    fileExtension: string,
    source: string,
  ): Extract<CachedInjectionFragment, { contextKind: "topLevel" }> | undefined {
    const key = createInjectionCacheKey("topLevel", hookRef, fileExtension, source);
    const cached = this.entries.get(key);

    if (!cached || cached.contextKind !== "topLevel") {
      this.missCount += 1;
      return undefined;
    }

    cached.hits += 1;
    cached.lastAccessedAt = Date.now();
    this.hitCount += 1;
    return cached;
  }

  setTopLevel(
    hookRef: string,
    fileExtension: string,
    source: string,
    program: ProgramNode,
  ): Extract<CachedInjectionFragment, { contextKind: "topLevel" }> {
    const key = createInjectionCacheKey("topLevel", hookRef, fileExtension, source);
    const cached: Extract<CachedInjectionFragment, { contextKind: "topLevel" }> = {
      contextKind: "topLevel",
      hookRef,
      fileExtension,
      sourceHash: hashSource(source),
      program,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      hits: 0,
    };

    this.entries.set(key, cached);
    return cached;
  }

  getGraphPipeline(
    hookRef: string,
    fileExtension: string,
    source: string,
  ): Extract<CachedInjectionFragment, { contextKind: "graphPipeline" }> | undefined {
    const key = createInjectionCacheKey("graphPipeline", hookRef, fileExtension, source);
    const cached = this.entries.get(key);

    if (!cached || cached.contextKind !== "graphPipeline") {
      this.missCount += 1;
      return undefined;
    }

    cached.hits += 1;
    cached.lastAccessedAt = Date.now();
    this.hitCount += 1;
    return cached;
  }

  setGraphPipeline(
    hookRef: string,
    fileExtension: string,
    source: string,
    steps: GraphPipelineStepNode[],
  ): Extract<CachedInjectionFragment, { contextKind: "graphPipeline" }> {
    const key = createInjectionCacheKey("graphPipeline", hookRef, fileExtension, source);
    const cached: Extract<CachedInjectionFragment, { contextKind: "graphPipeline" }> = {
      contextKind: "graphPipeline",
      hookRef,
      fileExtension,
      sourceHash: hashSource(source),
      steps,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      hits: 0,
    };

    this.entries.set(key, cached);
    return cached;
  }

  clear(): void {
    this.entries.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  stats(): RuntimeInjectionFragmentCacheStats {
    return {
      entries: this.entries.size,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }
}

const defaultRuntimeInjectionFragmentCache = new RuntimeInjectionFragmentCache();

export function getDefaultRuntimeInjectionFragmentCache(): RuntimeInjectionFragmentCache {
  return defaultRuntimeInjectionFragmentCache;
}

export function resolveRuntimeInjectionFragmentCache(
  option: boolean | RuntimeInjectionFragmentCache | undefined,
): RuntimeInjectionFragmentCache | undefined {
  if (!option) return undefined;
  if (option === true) return defaultRuntimeInjectionFragmentCache;
  return option;
}

export function recordInjectionParseCacheHit(
  timing: RuntimeTimingCollector | undefined,
  contextKind: InjectionContextKind,
): void {
  timing?.record(`inject.${contextKind}.parse.cacheHit`, 0);
}

export function recordInjectionParseCacheMiss(
  timing: RuntimeTimingCollector | undefined,
  contextKind: InjectionContextKind,
): void {
  timing?.record(`inject.${contextKind}.parse.cacheMiss`, 0);
}

function createInjectionCacheKey(
  contextKind: InjectionContextKind,
  hookRef: string,
  fileExtension: string,
  source: string,
): string {
  return `${contextKind}:${hookRef}:${fileExtension}:${hashSource(source)}`;
}

function hashSource(source: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${source.length}:${(hash >>> 0).toString(16)}`;
}
