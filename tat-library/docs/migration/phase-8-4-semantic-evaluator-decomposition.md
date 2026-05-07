# Phase 8.4 Semantic Evaluator Decomposition

This pass continued structural pruning after the first Phase 8.4 split.

## Goals

- Reduce overloaded semantic evaluator files without changing behavior.
- Move repeated graph-value helper logic into small reusable modules.
- Continue aligning runtime internals with semantic vertical slices.

## Changes

### Action value evaluator split

Added:

```txt
runtime/execute/action/graphValueUtils.ts
runtime/execute/action/runtimeNode.ts
```

These extracted shared value helpers and runtime node/contract helpers from:

```txt
runtime/execute/action/valueEvaluator.ts
```

### Where evaluator split

Added:

```txt
runtime/query/where/value.ts
runtime/query/where/referenceKind.ts
```

These extracted where-value conversion, comparison helpers, truthiness/stringification helpers, and reference-kind inference from:

```txt
runtime/query/executeWhere.ts
```

## Validation

The following commands passed:

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing
npx tsx run-module.ts tests/semantic-directives-demo.tat --timing
npx tsx run-module.ts tests/phase7/import-compose-main.tat --timing
```

## Hotspot movement

The updated hotspot report was written to:

```txt
docs/reports/phase-8-4-semantic-evaluator-hotspots.md
```

Notable movement:

- `runtime/query/executeWhere.ts` dropped from score 82 to 72.
- `runtime/execute/action/valueEvaluator.ts` dropped from score 82 to 50.
- The remaining highest priority files are now:
  - `runtime/validation/expressions/expressionValidators.ts`
  - `parser/directives/parserDirectiveParsers.ts`
  - `runtime/query/executeWhere.ts`

## Next pruning targets

The next safe structural pruning targets are:

```txt
runtime/validation/expressions/expressionValidators.ts
parser/directives/parserDirectiveParsers.ts
runtime/query/relationshipComparison.ts
```

