# Phase 8.4 Structural Pruning Continued

This pass continues the behavior-preserving Phase 8.4 pruning after canonical syntax/runtime validation.

## Changes

- Split `runtime/execute/action.ts` again so it now delegates action step execution to:
  - `runtime/execute/action/pipeline.ts`
- Kept `runtime/execute/action.ts` as the public action orchestration/re-export surface.
- Split `runtime/query/executeWhere.ts` support logic into focused helpers:
  - `runtime/query/where/clone.ts`
  - `runtime/query/where/print.ts`
- Regenerated a hotspot report at:
  - `docs/reports/phase-8-4-pruning-hotspots.md`

## Validation

The following commands passed in the container:

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing
npx tsx run-module.ts tests/semantic-directives-demo.tat --timing
npx tsx run-module.ts tests/phase7/import-compose-main.tat --timing
```

## Notes

This was intentionally conservative. The next remaining hotspots are still:

- `runtime/query/executeWhere.ts`
- `runtime/validation/expressions/expressionValidators.ts`
- `runtime/execute/action/valueEvaluator.ts`
- `parser/directives/parserDirectiveParsers.ts`

The current split reduces overloaded orchestration files without changing TAT semantics.
