# Phase 8.5 Parse Cache / AST Reuse

Phase 8.5 adds an opt-in in-memory parsed AST cache.

## Goal

If a TAT source file has not changed, reuse its parsed root AST instead of tokenizing and parsing again.

## What is cached

The cache stores:

- source hash
- parsed `ProgramNode`
- token count
- creation/access timestamps
- hit count

The cache intentionally does **not** cache validation results yet.

## CLI usage

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing --cache
```

A single CLI run usually starts a fresh process, so the cache is most useful in long-lived runtimes such as apps, servers, and editor tooling.

## Smoke test

```bash
npx tsx tools/cache-smoke.ts tests/all-directives-expanded.tat
```

Expected behavior:

- first run: cache miss
- second run: cache hit

## Timing names

- `parseRoot.cacheMiss`
- `parseRoot.cacheHit`
- `tokenize`
- `parseRoot`

On cache hit, tokenization and parsing are skipped.
