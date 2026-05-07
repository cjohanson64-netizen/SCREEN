# Phase 8.4 Structural Pruning

Phase 8.4 begins the structural pruning work identified by the Phase 8.3 hotspot report.

## Implemented in this pass

### Action runtime split

The previous `runtime/execute/action.ts` file was the top hotspot. It mixed action execution, guard evaluation, project/value evaluation, scoped identifier resolution, runtime node helpers, aggregate/derive evaluation, and node contract helpers.

This pass reduced `runtime/execute/action.ts` to the action execution coordinator and moved action support into vertical-slice helper modules:

```txt
runtime/execute/action.ts
runtime/execute/action/types.ts
runtime/execute/action/valueEvaluator.ts
```

`runtime/execute/action.ts` now coordinates:

```txt
executeAction
executeActionStep
```

`runtime/execute/action/types.ts` owns action runtime contracts:

```txt
ActionScope
ActionExecutionResult
ActionExecutionHooks
ExtractedRuntimeNodeValue
```

`runtime/execute/action/valueEvaluator.ts` owns action guard/project/value support used by the coordinator and action pipeline helpers.

## Why this pass was conservative

This pass intentionally avoided changing runtime behavior. The goal was to split the largest action runtime hotspot without changing action semantics.

## Validation

The following fixtures should pass after this pass:

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing
npx tsx run-module.ts tests/semantic-directives-demo.tat --timing
npx tsx run-module.ts tests/phase7/import-compose-main.tat --timing
```

## Remaining 8.4 targets

The updated hotspot report shows the next structural pruning targets:

```txt
runtime/query/executeWhere.ts
runtime/validation/expressions/expressionValidators.ts
runtime/execute/action/valueEvaluator.ts
parser/directives/parserDirectiveParsers.ts
```

The action coordinator is no longer the top hotspot, but the extracted action value evaluator should be split further in the next pruning pass.
