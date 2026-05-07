# Phase 8.7 Runtime Execution Profiling

Phase 8.7 adds optional directive-level runtime profiling. Phase 8.1 timing answers how long major runtime phases take; Phase 8.7 answers which semantic operations are responsible for work inside execution.

## CLI usage

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing --profile
```

`--profile` enables a runtime profiler and prints an operation table after the normal timing report. `--profile` also enables timing so the phase-level and directive-level views can be read together.

## Profiled operations

The profiler records operation count, total duration, average duration, and max duration for semantic runtime operations such as:

```txt
@graft.branch
@graft.state
@graft.meta
@prune.*
@runtime.addNode
@runtime.updateNodeValue
@runtime.deleteNode
@query.edge
@query.state
@query.meta
@if
@when
@repeat
@action.apply
@project.apply
@inject.graphPipeline
```

## Runtime architecture

The profiler lives in:

```txt
runtime/instrumentation/profiler.ts
```

and is attached to `RuntimeState` when profiling is enabled. This keeps profiling reusable by the CLI, future backend runtimes, and apps.

## Design constraints

- Profiling is opt-in.
- Normal runtime output remains quiet without `--profile`.
- Profiling records execution metrics only; it does not optimize or change behavior.
- Execution result caching is intentionally not part of Phase 8.7.

## Validation commands

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing --profile --cache
npx tsx run-module.ts tests/semantic-directives-demo.tat --timing --profile --cache
npx tsx run-module.ts tests/phase7/import-compose-main.tat --timing --profile --cache
npx tsx tools/cache-smoke.ts tests/all-directives-expanded.tat
npx tsx tools/injection-cache-smoke.ts
```
