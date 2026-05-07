import type { ProgramNode } from "../../ast/nodeTypes.js";
import type { Token } from "../../lexer/tokenize.js";
import type { RuntimeTimingCollector } from "../instrumentation/timing.js";

export interface CachedParsedSource {
  sourceHash: string;
  ast: ProgramNode;
  tokenCount: number;
  createdAt: number;
  lastAccessedAt: number;
  hits: number;
}

export interface RuntimeParseCacheStats {
  entries: number;
  hits: number;
  misses: number;
}

export class RuntimeParseCache {
  private readonly entries = new Map<string, CachedParsedSource>();
  private hitCount = 0;
  private missCount = 0;

  get(filePath: string, source: string): CachedParsedSource | undefined {
    const key = createParseCacheKey(filePath, source);
    const cached = this.entries.get(key);

    if (!cached) {
      this.missCount += 1;
      return undefined;
    }

    cached.hits += 1;
    cached.lastAccessedAt = Date.now();
    this.hitCount += 1;
    return cached;
  }

  set(filePath: string, source: string, ast: ProgramNode, tokens: Token[]): CachedParsedSource {
    const key = createParseCacheKey(filePath, source);
    const cached: CachedParsedSource = {
      sourceHash: hashSource(source),
      ast,
      tokenCount: tokens.length,
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

  stats(): RuntimeParseCacheStats {
    return {
      entries: this.entries.size,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }
}

const defaultRuntimeParseCache = new RuntimeParseCache();

export function getDefaultRuntimeParseCache(): RuntimeParseCache {
  return defaultRuntimeParseCache;
}

export function resolveRuntimeParseCache(
  option: boolean | RuntimeParseCache | undefined,
): RuntimeParseCache | undefined {
  if (!option) return undefined;
  if (option === true) return defaultRuntimeParseCache;
  return option;
}

export function recordParseCacheHit(
  timing: RuntimeTimingCollector | undefined,
): void {
  timing?.record("parseRoot.cacheHit", 0);
}

export function recordParseCacheMiss(
  timing: RuntimeTimingCollector | undefined,
): void {
  timing?.record("parseRoot.cacheMiss", 0);
}

function createParseCacheKey(filePath: string, source: string): string {
  return `${filePath}:${hashSource(source)}`;
}

function hashSource(source: string): string {
  // FNV-1a 32-bit. This is intentionally small and dependency-free; the cache
  // key also includes source length to reduce accidental collision risk.
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${source.length}:${(hash >>> 0).toString(16)}`;
}
