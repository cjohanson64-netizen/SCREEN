# Phase 8.6 — Injection Fragment Cache

Phase 8.6 adds an opt-in in-memory cache for parsed `@inject` fragments.

## Goal

When the same injection hook, file extension, source text, and context kind are used repeatedly, TAT can reuse the parsed injection AST fragment instead of tokenizing and parsing it again.

## Cache key

```txt
contextKind + hookRef + fileExtension + sourceHash
```

`contextKind` is one of:

```txt
topLevel
graphPipeline
```

## What is cached

Only parsed injection fragments are cached:

- top-level injections cache a parsed `ProgramNode`
- graph-flow injections cache parsed `GraphPipelineStepNode[]`

Execution results are not cached because they depend on the current graph/runtime state.

## CLI usage

The existing `--cache` flag now enables both the root parse cache and the injection fragment cache:

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing --cache
```

## Smoke test

```bash
npx tsx tools/injection-cache-smoke.ts tests/injection/inject-graph-flow.tat
```

Expected behavior:

```txt
first run = injection parse cache miss
second run = injection parse cache hit
```

## Timing markers

```txt
inject.topLevel.parse.cacheHit
inject.topLevel.parse.cacheMiss
inject.graphPipeline.parse.cacheHit
inject.graphPipeline.parse.cacheMiss
```
