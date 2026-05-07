# Phase 8.1 Runtime Timing Instrumentation

Phase 8.1 adds optional runtime timing instrumentation to the TAT library.

## CLI usage

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing
```

Normal runs remain quiet. Timing output appears only when `--timing` is passed.

## What is measured

Current timing labels include:

- `readSource`
- `tokenize`
- `parseRoot`
- `resolveImports`
- `executeProgram`
- `execute.graphPipeline`
- `inject.topLevel.parse`
- `inject.topLevel.validate`
- `inject.topLevel.execute`
- `inject.graphFlow.parse`
- `inject.graphFlow.validate`
- `inject.graphFlow.execute`

## Runtime API

`executeTatModule(path, { timing: true })` returns a `timing` report on the loaded module.

`executeProgram(ast, { timing: true })` returns a `timing` report on the execution result.

Library exports now include:

- `RuntimeTimingEntry`
- `RuntimeTimingReport`
- `createRuntimeTimingCollector`

## Intent

This phase does not optimize TAT yet. It measures where time is spent so later phases can make evidence-based decisions about caching, profiling, and incremental execution.
