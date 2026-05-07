# Phase 6.1 — Semantic Naming Alignment

This cleanup aligns directive names, AST interface names, AST `type` strings, filenames, parser construction, and runtime metadata for the Phase 5 semantic directive model.

## Completed alignment

### `@compute.*`

The compute directives no longer use legacy `Derive*` AST names.

| Directive | Old AST interface/type | New AST interface/type | New file |
|---|---|---|---|
| `@compute.count` | `DeriveCountExprNode` / `DeriveCountExpr` | `ComputeCountExprNode` / `ComputeCountExpr` | `ast/compute/ComputeCountExprNode.ts` |
| `@compute.edgeCount` | `DeriveEdgeCountExprNode` / `DeriveEdgeCountExpr` | `ComputeEdgeCountExprNode` / `ComputeEdgeCountExpr` | `ast/compute/ComputeEdgeCountExprNode.ts` |
| `@compute.exists` | `DeriveExistsExprNode` / `DeriveExistsExpr` | `ComputeExistsExprNode` / `ComputeExistsExpr` | `ast/compute/ComputeExistsExprNode.ts` |
| `@compute.sum` | `DeriveSumExprNode` / `DeriveSumExpr` | `ComputeSumExprNode` / `ComputeSumExpr` | `ast/compute/ComputeSumExprNode.ts` |
| `@compute.min` | `DeriveMinExprNode` / `DeriveMinExpr` | `ComputeMinExprNode` / `ComputeMinExpr` | `ast/compute/ComputeMinExprNode.ts` |
| `@compute.max` | `DeriveMaxExprNode` / `DeriveMaxExpr` | `ComputeMaxExprNode` / `ComputeMaxExpr` | `ast/compute/ComputeMaxExprNode.ts` |
| `@compute.avg` | `DeriveAvgExprNode` / `DeriveAvgExpr` | `ComputeAvgExprNode` / `ComputeAvgExpr` | `ast/compute/ComputeAvgExprNode.ts` |
| `@compute.abs` | `DeriveAbsExprNode` / `DeriveAbsExpr` | `ComputeAbsExprNode` / `ComputeAbsExpr` | `ast/compute/ComputeAbsExprNode.ts` |

Also added:

- `ast/compute/ComputeExprNode.ts`
- `ast/compute/ComputeSourceNode.ts`

Runtime helper naming now uses `evaluateCompute*` and `evaluateComputeSource` for compute semantics.

### `@choose`

The value-level conditional no longer uses `IfValueExprNode` / `IfValueExpr`.

| Directive | Old AST interface/type | New AST interface/type | New file |
|---|---|---|---|
| `@choose` | `IfValueExprNode` / `IfValueExpr` | `ChooseExprNode` / `ChooseExpr` | `ast/action/ChooseExprNode.ts` |

`@if` remains `IfExprNode` / `IfExpr` and is reserved for pipeline/control-flow branching.

## Verification

The cleanup removed legacy references to:

- `DeriveCountExpr`, `DeriveEdgeCountExpr`, `DeriveExistsExpr`, `DeriveSumExpr`, `DeriveMinExpr`, `DeriveMaxExpr`, `DeriveAvgExpr`, `DeriveAbsExpr`
- `DeriveAggregateSourceNode`
- `IfValueExprNode` / `IfValueExpr`

Smoke checks run:

- `tests/all-directives-expanded.tat` parse + validate
- `tests/semantic/graph-bridge-attachment.tat` execute
- `tests/semantic/graph-bridge-collapsed.tat` execute
- injection fixture parse + validate

