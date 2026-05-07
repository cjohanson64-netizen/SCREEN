# Phase 8.4b: Validation + Directive Parser Decomposition

This pass continues Phase 8.4 structural pruning by splitting the two dominant semantic dispatch hubs identified by the hotspot report:

- `runtime/validation/expressions/expressionValidators.ts`
- `parser/directives/parserDirectiveParsers.ts`

## Validation decomposition

`expressionValidators.ts` is now a small barrel that re-exports focused validation modules:

```txt
runtime/validation/expressions/
  shared.ts
  validateAction.ts
  validateControl.ts
  validateDerive.ts
  validateMutation.ts
  validateQuery.ts
  validateValue.ts
  expressionValidators.ts
```

The split keeps public imports stable while moving validation behavior into semantic slices.

## Directive parser decomposition

`parserDirectiveParsers.ts` is now a small barrel that re-exports focused parser modules:

```txt
parser/directives/
  action/actionParsers.ts
  compute/computeParsers.ts
  control/controlParsers.ts
  graph/graphParsers.ts
  project/projectParsers.ts
  query/queryParsers.ts
  runtime/runtimeParsers.ts
  shared/directiveCallParsers.ts
  parserDirectiveParsers.ts
```

This preserves existing `Parser.ts` imports while aligning directive parsing with the vertical-slice architecture.

## Utility boundary stabilization

This pass also stabilizes helper exports exposed by earlier pruning:

- `runtime/query/where/clone.ts` now exports clone helpers.
- `runtime/query/where/referenceKind.ts` now exports value helpers and imports `GraphValue` explicitly.
- `runtime/query/where/value.ts` re-exports shared where value helpers.
- `runtime/execute/action/valueEvaluator.ts` re-exports action runtime value helpers needed by action pipeline execution.

## Validation performed

The following runtime validations passed:

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing
npx tsx run-module.ts tests/semantic-directives-demo.tat --timing
npx tsx run-module.ts tests/phase7/import-compose-main.tat --timing
npx tsx tools/code-health/hotspots.ts --out docs/reports/phase-8-4b-hotspots.md
```

A full local `npx tsc --noEmit` should be run in the user's local environment where Node/Vitest typings are already installed.
